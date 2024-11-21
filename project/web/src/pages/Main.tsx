import { Box, Heading } from "@chakra-ui/react";
import FilmList from "../components/film/FilmList";
import CommonLayout from "../components/CommonLayout";

export default function Main(): React.ReactElement {
  return (
    <CommonLayout>
      <Box>
        <Heading size="lg">최고의 장면을 찾아보세요</Heading>
        <FilmList />
      </Box>
    </CommonLayout>
  );
}
