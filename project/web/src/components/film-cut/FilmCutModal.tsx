// 반응형 hook(useBreakpointValue)
import {
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
// 특정 컷 데이터를 불러오는 GraphQL 쿼리 hook
import { useCutQuery } from "../../generated/graphql";
import { FilmCutDetail } from "./FilmCutDetail";

interface FilmCutModalProps {
  open: boolean;
  onClose: () => void;
  cutId: number;
}

function FilmCutModal({
  open,
  onClose,
  cutId,
}: FilmCutModalProps): React.ReactElement {
  const { loading, data } = useCutQuery({
    variables: { cutId: Number(cutId) }, // cutId를 변수로 전달하여 해당 컷 데이터를 요청
  });

  // 화면 가로 크기에 따라 modalSize 값을 설정 (작은 화면에서는 'full', 중간 이상의 화면에서는 'xl')
  // 모바일, 태블릿의 경우 화면을 꽉 채우고, 그 이상의 화면에서는 고정된 크기.
  const modalSize = useBreakpointValue({ base: "full", md: "xl" });

  return (
    <Modal
      onClose={onClose}
      isOpen={open}
      isCentered // 모달이 화면 중앙에 배치됨
      size={modalSize} // 화면 크기에 따라 모달 크기 조정
      preserveScrollBarGap // 모달을 열었을 때 스크롤바가 나타날 경우 레이아웃을 유지
    >
      <ModalOverlay />
      {/* 모달 배경 */}
      <ModalContent pt={2}>
        {/* 모달 내용 */}
        <ModalHeader>{data?.cut?.film?.title}</ModalHeader>
        {/* 영화 제목 표시 */}
        <ModalCloseButton mt={3} />
        {/* 모달 닫기 버튼 */}
        <ModalBody>
          {loading && (
            <Center py={4}>
              <Spinner />
            </Center>
          )}
          {/* 로딩이 끝났지만 데이터가 없는 경우 */}
          {!loading && !data && <Center>데이터를 불러오지 못했습니다.</Center>}
          {/* 데이터가 있을 경우 FilmCutDetail 컴포넌트에 컷 이미지를 전달하여 상세 정보 표시 */}
          {data && data.cut && (
            <FilmCutDetail
              cutImg={data.cut.src}
              cutId={data.cut.id}
              votesCount={data.cut.votesCount}
              isVoted={data.cut.isVoted}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default FilmCutModal;
