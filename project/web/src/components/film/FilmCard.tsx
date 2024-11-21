import {
  AspectRatio, // 가로 세로 비율을 맞춰주는 컴포넌트
  Box, // 레이아웃을 잡는 기본 컨테이너
  Heading, // 제목을 표시하는 컴포넌트
  Image, // 이미지 컴포넌트
  LinkBox,
  LinkOverlay, // 클릭 가능한 박스를 만들기 위한 컴포넌트
  Stack, // 요소들을 수직으로 쌓는 레이아웃 컴포넌트
  Text, // 텍스트를 표시하는 컴포넌트
  useColorModeValue, // 다크 모드와 라이트 모드에 따라 색상을 변경할 때 사용
} from "@chakra-ui/react";
import React from "react";
import { FilmsQuery } from "../../generated/graphql";
import { Link } from "react-router-dom";

// FilmCard 컴포넌트의 Props 인터페이스 정의
interface FilmCardProps {
  film: FilmsQuery["films"]["films"][0]; // film은 GraphQL 쿼리에서 받은 영화 데이터를 타입으로 지정
}

export default function FilmCard({ film }: FilmCardProps): React.ReactElement {
  return (
    // LinkBox는 클릭 가능한 아티클을 만드는 컴포넌트로 사용
    <LinkBox as="article" my={6}>
      <Box
        maxW="300px" // 카드의 최대 너비를 300px로 설정
        w="full" // 너비를 가득 채움
        rounded="md" // 모서리를 둥글게 처리
        px={{ base: 1, md: 3 }} // 화면 크기에 따라 패딩을 조정 (작을 때는 1, 클 때는 3)
        pt={3} // 위쪽 패딩 설정
        overflow="hidden" // 내부 콘텐츠가 넘칠 경우 숨김 처리
      >
        {/* 이미지 컨테이너 설정 */}
        <Box bg="gray" mt={-3} mx={-3} mb={2} pos="relative">
          {/* 가로 세로 비율을 2:3으로 맞춘 이미지 컨테이너 */}
          <AspectRatio ratio={2 / 3}>
            <Image src={film.posterImg} />
            {/* 영화 포스터 이미지 표시 */}
          </AspectRatio>
        </Box>

        {/* 영화 제목 및 부제목 */}
        <Stack>
          {/* LinkOverlay는 내부 콘텐츠가 클릭 가능한 링크가 되도록 설정 */}
          <LinkOverlay as={Link} to={`/film/${film.id}`}>
            <Heading
              color={useColorModeValue("gray.700", "white")} // 모드에 따라 텍스트 색상 변경
              fontSize="xl" // 제목 크기를 설정
              fontFamily="body" // 폰트 패밀리를 본문 스타일로 설정
            >
              {film.title}
              {/* // 영화 제목 표시 */}
            </Heading>
          </LinkOverlay>
          {/* 영화 부제목 표시, 없으면 공백 */}
          <Text
            fontSize="sm" // 작은 폰트 크기
            color="gray.500" // 회색 텍스트 색상
            isTruncated // 텍스트 길이가 길 경우 생략(말줄임표) 처리
          >
            {film.subtitle ? film.subtitle : <>&nbsp;</>}
            {/* 부제목이 있으면 부제목을 표시, 없으면 공백 */}
          </Text>
        </Stack>

        {/* 개봉일과 러닝 타임, 감독 이름 */}
        <Stack spacing={0} fontSize="sm" mt={2}>
          {/* 개봉일과 러닝 타임 */}
          <Text as="time" dateTime={film.release} isTruncated color="gray.500">
            {`${film.release}  .  ${film.runningTime}분`}
            {/* 개봉일과 러닝 타임을 표시 */}
          </Text>
          {/* 감독 이름 */}
          <Text isTruncated>{film.director.name}</Text>
          {/* 감독 이름을 표시 */}
        </Stack>
      </Box>
    </LinkBox>
  );
}
