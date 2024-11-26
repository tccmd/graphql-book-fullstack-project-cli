import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  useColorModeValue,
  Text,
  useToast,
  useDisclosure,
  Center,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";
import {
  CutDocument,
  CutQuery,
  CutQueryVariables,
  useMeQuery,
  useVoteMutation,
} from "../../generated/graphql";
import { useMemo } from "react";
import { FilmCutReviewRegiModal } from "./FilmCutReviewRegiModal";
import { FilmCutReview } from "./FilmCutReview";
import FilmCutDetailDeleteAlert from "./FilmCutReviewDelete";

interface FilmCutDetailProps {
  cutImg: string;
  cutId: number;
  isVoted?: boolean;
  votesCount?: number;
  reviews: CutQuery["cutReviews"];
}

export function FilmCutDetail({
  cutImg,
  cutId,
  isVoted = false,
  votesCount = 0,
  reviews,
}: FilmCutDetailProps): JSX.Element {
  const toast = useToast();
  const voteButtonColor = useColorModeValue("gray.500", "gray.400");
  const [vote, { loading: voteLoading }] = useVoteMutation({
    variables: { cutId },
    // 뮤테이션 요청 이후 캐시를 지우거나, 새롭게 덮어쓰는 등 캐시를 조절할 수 있다.
    // update 옵션은 cache 객체와 뮤테이션 요청에 대한 응답 객체인 fetchResult를 받는 콜백 함수를 요구한다.
    update: (cache, fetchResult) => {
      // 'cut' Query 데이터 조회
      // cache 객체는 readQuery, writeQuery 함수 등을 가지고 있다.
      // readQuery: 특정 쿼리 캐시 데이터를 조회하는 함수
      // <읽거나 덮어쓸 쿼리 타입, 해당 쿼리의 파라미터 타입>
      // readQuery 함수의 query 옵션에 데이터를 가져올 쿼리 문자열 CutDocument를 입력하고,
      // variables 옵션에 cutId를 명시해 현재 좋아요를 누른 명장면 데이터를 캐시로부터 가져온다.
      const currentCut = cache.readQuery<CutQuery, CutQueryVariables>({
        query: CutDocument,
        variables: { cutId },
      });
      if (currentCut && currentCut.cut) {
        // vote 뮤테이션이 성공한 경우에만
        if (fetchResult.data?.vote) {
          // 'cut' Query의 데이터를 재설정
          // writeQuery: 특정 쿼리 캐시 데이터를 덮어쓰는 함수
          // writeQuery 함수를 통해 Cut에 대한 캐시 데이터를 덮어쓰도록 구성
          cache.writeQuery<CutQuery, CutQueryVariables>({
            query: CutDocument,
            variables: { cutId: currentCut.cut.id },
            data: {
              __typename: "Query",
              ...currentCut,
              cut: {
                ...currentCut.cut,
                votesCount: isVoted
                  ? currentCut.cut.votesCount - 1
                  : currentCut.cut.votesCount + 1,
                isVoted: !isVoted,
              },
            },
          });
        }
      }
    },
  });
  const accessToken = localStorage.getItem("access_token");
  const { data: userData } = useMeQuery({ skip: !accessToken });
  const isLoggedIn = useMemo(() => {
    if (accessToken) return userData?.me?.id;
    return false;
  }, [accessToken, userData?.me?.id]);
  const reviewRegiDialog = useDisclosure();
  const deleteAlert = useDisclosure();
  return (
    <Box>
      <AspectRatio ratio={16 / 9}>
        {/* 주어진 비율로 이미지 컨테이너를 설정 */}
        <Image src={cutImg} objectFit="cover" fallbackSrc="" />
        {/* 로딩 중 fallbackSrc로 기본 이미지를 표시 (현재는 빈 문자열로 설정됨)*/}
      </AspectRatio>

      {/* 상하 여백을 주어 이미지 하단에 텍스트와 버튼을 배치 */}
      <Box py={4}>
        {/* Flex로 공간을 양쪽 끝에 배치하고, 정렬 설정 */}
        <Flex justify="space-between" alignItems="center">
          {/* 해딩으로 cutId를 표시, 작은 사이즈 텍스트 */}
          <Heading size="sm">{cutId}번째 사진</Heading>
          {/* HStack으로 버튼들을 가로로 나란히 배치하고, 간격을 설정 */}
          <HStack spacing={1} alignItems="center">
            {/* 하트 아이콘 버튼을 만들고 aria-label로 접근성 개선 */}
            <Button
              color={isVoted ? "pink.400" : voteButtonColor}
              aria-label="like-this-cut-button"
              leftIcon={<FaHeart />}
              isLoading={voteLoading}
              onClick={() => {
                if (isLoggedIn) vote();
                else {
                  toast({
                    status: "warning",
                    description: "좋아요 표시는 로그인 이후 가능합니다.",
                  });
                }
              }}
            >
              <Text>{votesCount}</Text>
            </Button>
            {/* '감상 남기기' 버튼, 청록색(teal) 색상으로 스타일링 */}
            <Button colorScheme="teal" onClick={reviewRegiDialog.onOpen}>
              감상 남기기
            </Button>
          </HStack>
        </Flex>
      </Box>
      {/* 감상 목록 */}
      <Box mt={6}>
        {!reviews || reviews.length === 0 ? (
          <Center minH={100}>
            <Text>제일 먼저 감상을 남겨보세요!</Text>
          </Center>
        ) : (
          <SimpleGrid mt={3} spacing={4} columns={{ base: 1, sm: 2 }}>
            {reviews.slice(0, 2).map((review) => (
              <FilmCutReview
                key={review.id}
                author={review.user.username}
                contents={review.contents}
                isMine={review.isMine}
                onEditClick={reviewRegiDialog.onOpen}
                onDeleteClick={deleteAlert.onOpen}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
      <FilmCutReviewRegiModal
        cutId={cutId}
        isOpen={reviewRegiDialog.isOpen}
        onClose={reviewRegiDialog.onClose}
      />
      <FilmCutDetailDeleteAlert
        target={reviews.find((review) => review.isMine)}
        isOpen={deleteAlert.isOpen}
        onClose={deleteAlert.onClose}
      />
    </Box>
  );
}
