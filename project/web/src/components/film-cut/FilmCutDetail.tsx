import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
} from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";

interface MovieCutDetailProps {
  cutImg: string;
  cutId: number;
}

export function FilmCutDetail({
  cutImg,
  cutId,
}: MovieCutDetailProps): JSX.Element {
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
            <Button aria-label="like-this-cut-button" leftIcon={<FaHeart />} />
            {/* '감상 남기기' 버튼, 청록색(teal) 색상으로 스타일링 */}
            <Button colorScheme="teal">감상 남기기</Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
