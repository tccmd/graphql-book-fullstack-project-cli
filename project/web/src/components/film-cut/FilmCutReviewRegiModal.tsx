import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import {
  // 캐시에서 읽어올 GraphQL 쿼리
  CutDocument,
  // 쿼리 결과 타입
  CutQuery,
  // 감상평 등록/수정 mutation 변수 타입
  CreateOrUpdateCutReviewMutationVariables as CutReviewVars,
  // 감상평 등록/수정 mutation 훅
  useCreateOrUpdateCutReviewMutation as useCreateCutReview,
} from '../../generated/graphql';
import { useForm } from 'react-hook-form';

export interface FilmCutReviewRegiModalProps {
  cutId: number;
  isOpen: boolean;
  onClose: () => void;
}

// FilmCutReviewRegiModal 컴포넌트: 영화 장면에 대한 감상평을 등록할 수 있는 모달
export function FilmCutReviewRegiModal({ cutId, isOpen, onClose }: FilmCutReviewRegiModalProps): JSX.Element {
  const toast = useToast();
  // GraphQL Mutation과 로딩 상태
  const [mutation, { loading }] = useCreateCutReview();
  // React Hook Form 설정
  const {
    // 각 폼 필드(예: 텍스트 입력이나 텍스트 에어리어)를 register로 연결하면, 이 입력값이 자동으로 폼 상태에 포함되고 제출 시 폼 데이터에 포함됨
    register,
    // handleSubmit은 폼이 제출될 때 호출되는 함수로, 폼 데이터를 인자로 받아 원하는 로직을 수행할 수 있게 함
    handleSubmit,
    formState: { errors },
    // 폼 입력값이 이 타입과 일치하도록
    // useForm에서 defaultValues를 설정하면, 폼이 초기화될 때 기본값으로 사용할 데이터를 설정할 수 있음
    // cutReviewInput이라는 필드 안에 cutId 값을 설정
    // 이 폼을 사용하는 컴포넌트가 cutId를 항상 포함하는 기본 데이터를 갖게 됨
  } = useForm<CutReviewVars>({ defaultValues: { cutReviewInput: { cutId } } });

  // 감상평 등록 요청이 성공 또는 실패할 때 호출되는 함수
  function onSubmit(formData: CutReviewVars): void {
    // console.log('onSubmit 실행됨');
    // 감상평 등록 Mutation 요청
    mutation({
      variables: formData,
      // Mutation 후 캐시 업데이트를 위한 함수
      update: (cache, { data }) => {
        // console.log('cache: ', cache);
        // console.log('data: ', data);
        if (data && data.createOrUpdateCutReview) {
          // // console.log('data.createOrUpdateCutReview: ', data.createOrUpdateCutReview);
          // 캐시에 저장된 현재의 cut 정보를 읽어옴
          const currentCut = cache.readQuery<CutQuery>({
            query: CutDocument,
            variables: { cutId },
          });
          // // console.log('currentCut: ', currentCut);
          if (currentCut) {
            // 감상평이 이미 존재하는지 확인
            const isEdited = currentCut.cutReviews.map((review) => review.id).includes(data.createOrUpdateCutReview.id);
            if (isEdited) {
              // 기존의 감상평이 업데이트된 경우, 기존 캐시를 삭제
              // cache.evict: Apollo Client에서 캐시의 특정 객체를 제거할 때 사용
              cache.evict({
                id: `CutReview:${data.createOrUpdateCutReview.id}`,
              });
              // console.log('cache.evict: ', cache.evict);
            }
            // console.log('CutDocument: ', CutDocument);
            // 캐시 업데이트: 새로운 감상평을 포함한 최신 데이터로 덮어씀
            cache.writeQuery<CutQuery>({
              query: CutDocument,
              data: {
                ...currentCut,
                cutReviews: isEdited
                  ? [...currentCut.cutReviews] // 기존 감상평이 수정된 경우 현재 상태 유지
                  : [data.createOrUpdateCutReview, ...currentCut.cutReviews.slice(0, 1)], // 새로운 감상평을 추가
              },
              variables: { cutId },
            });
          }
        }
      },
    })
      .then((res) => {
        // 등록한 데이터 콘솔에 출력 (디버깅용)
        // console.log(formData);
        // 성공 시 모달 닫기
        onClose();
      })
      .catch(() => {
        // 실패 시 에러 알림
        toast({ title: '감상평 등록 실패', status: 'error' });
      });
  }
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>감상 남기기</ModalHeader>
        <ModalBody>
          <FormControl>
            <Textarea
              // cutReviewInput.contents 필드를 register로 등록하여 감상평 내용을 react-hook-form이 추적하도록 설정
              // eslint-disale-next-line react/jsx-props-no-spreading
              {...register('cutReviewInput.contents', {
                // 필수 입력 설정 및 에러 메시지
                required: { value: true, message: '감상평을 입력해주세요.' },
                // 최대 글자수 제한 및 에러 메시지
                maxLength: {
                  value: 500,
                  message: '500자를 초과할 수 없습니다.',
                },
              })}
              // 텍스트 박스 placeholder
              placeholder="장면에 대한 개인적인 감상을 남겨주세요."
            />
            <FormErrorMessage>{errors.cutReviewInput?.contents?.message}</FormErrorMessage>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button colorScheme="teal" type="submit" isDisabled={loading}>
              등록
            </Button>
            <Button onClick={onClose}>취소</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
