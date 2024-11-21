import { Box, Flex, Heading, Image, Tag, Text } from "@chakra-ui/react";
import { FilmQuery } from "../../generated/graphql";

// FilmDetail 컴포넌트가 받을 props 타입을 정의
// 'film'은 선택적으로 제공되며, FilmQuery의 'film' 필드를 참조
interface FilmDetailProps {
  film?: FilmQuery["film"];
}

export default function FilmDetail({
  film,
}: FilmDetailProps): React.ReactElement {
  return (
    // Flex 박스 레이아웃으로 영화 정보를 배치
    <Flex
      mt={12} // 상단 여백 설정
      flexDirection={{ base: "column", md: "row" }} // 화면 크기에 따라 열 또는 행으로 정렬
      alignItems="center" // 아이템을 중앙 정렬
    >
      {/* 영화 포스터 이미지 박스 */}
      <Box maxW={250} flex={1}>
        {" "}
        {/* 박스 너비 최대 250px로 설정 */}
        <Image src={film?.posterImg} borderRadius={20} />{" "}
        {/* 영화 포스터 이미지 출력, 둥근 모서리 설정 */}
      </Box>

      {/* 영화 정보가 나오는 두 번째 Flex 박스 */}
      <Flex
        flex={1} // 남은 공간을 채우도록 설정
        ml={{ base: 0, md: 6 }} // 작은 화면에서는 여백 없고, 큰 화면에서는 왼쪽 여백 6 설정
        flexDirection="column" // 세로 방향으로 정렬
        alignContent="center" // 가운데로 정렬
        justify="center" // 수직 방향으로 가운데 정렬
        alignItems="flex-start" // 왼쪽 정렬
      >
        {/* 장르 태그들 */}
        <Flex mt={2}>
          {" "}
          {/* 상단 여백 설정 */}
          {/* 영화의 장르를 쉼표로 분리해서 각각의 태그로 출력 */}
          {film?.genre.split(",").map((genre) => (
            <Tag key={genre} mr={2} size="sm">
              {" "}
              {/* 각각의 장르에 태그를 붙이고, 작은 사이즈로 설정 */}
              {genre} {/* 장르 이름 출력 */}
            </Tag>
          ))}
        </Flex>

        {/* 영화 제목 및 개봉 연도 */}
        <Heading mb={4}>
          {" "}
          {/* 하단 여백 설정 */}
          {film?.title} {/* 영화 제목 출력 */}
          {/* 개봉 연도가 있을 경우 괄호 안에 표시 */}
          {film?.release ? `(${new Date(film?.release).getFullYear()})` : null}
        </Heading>

        {/* 영화 부제목 */}
        <Heading size="md" mb={2}>
          {" "}
          {/* 중간 크기의 제목과 하단 여백 설정 */}
          {film?.subtitle} {/* 영화 부제목 출력 */}
        </Heading>

        {/* 감독 이름 및 상영 시간 */}
        <Text mb={2}>
          {" "}
          {/* 하단 여백 설정 */}
          {film?.director.name} {/* 감독 이름 출력 */}
          {" • "} {/* 구분자 점 표시 */}
          {/* 영화 상영 시간이 있을 경우 상영 시간과 "분"을 표시 */}
          {!film ? "" : `${film?.runningTime} 분`}
        </Text>

        {/* 영화 설명 */}
        <Text fontSize="sm">
          {" "}
          {/* 작은 글씨로 설정 */}
          {film?.description} {/* 영화 설명 출력 */}
        </Text>
      </Flex>
    </Flex>
  );
}
