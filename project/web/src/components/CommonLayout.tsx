import { BackgroundProps, Box, Flex } from "@chakra-ui/react"; // Chakra UI에서 배경 속성 및 레이아웃 관련 컴포넌트를 가져옴
import Navbar from "./nav/Navbar";

// CommonLayout 컴포넌트에 사용할 타입 정의
interface CommonLayoutProps {
  bg?: BackgroundProps["bg"]; // bg는 배경 속성으로 선택 사항이며, Chakra UI의 BackgroundProps에서 가져옴
  children: React.ReactNode; // children은 React 컴포넌트나 JSX 요소를 의미
}

// CommonLayout 컴포넌트 정의
export default function CommonLayout({
  children,
  bg,
}: CommonLayoutProps): React.ReactElement {
  return (
    <div>
      <Navbar />
      {/* Box는 레이아웃의 본문을 감싸는 박스로, 반응형 패딩과 배경(bg)을 가짐 */}
      <Box
        px={{ base: 4 }} // 모바일(기본) 화면에서 좌우 패딩 4
        pt={24} // 상단에 24만큼의 패딩
        mx="auto" // 좌우 여백을 자동으로 설정하여 중앙에 배치
        maxW="960px" // 최대 너비를 960px로 설정
        minH="100vh" // 최소 높이를 100vh로 설정하여 화면 전체 높이를 차지
        w="100%" // 너비는 100%
        bg={bg} // 배경 색상은 props로 전달된 값 사용
      >
        {children} {/* 자식 요소를 이 박스 안에 렌더링 */}
      </Box>
    </div>
  );
}
