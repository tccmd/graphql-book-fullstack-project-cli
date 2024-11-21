// Apollo Client와 관련된 모듈을 import
import { ApolloProvider } from "@apollo/client";
import { ChakraProvider, Box, Text, theme } from "@chakra-ui/react";
// import * as React from "react";
import FilmList from "./components/film/FilmList";
import { createApolloClient } from "./apollo/createApolloClient";

// Apollo Client 인스턴스 생성
const apolloClient = createApolloClient();

// React 컴포넌트 정의
export const App = () => (
  // ApolloProvider로 앱 전체에 Apollo Client를 제공
  <ApolloProvider client={apolloClient}>
    {/* ChakraProvider로 앱 전체에 Chakra UI 테마를 적용 */}
    <ChakraProvider theme={theme}>
      {/* Chakra UI의 Box 컴포넌트를 사용해 텍스트를 중앙 정렬 */}
      <Box textAlign="center" fontSize="xl">
        {/* Chakra UI의 Text 컴포넌트를 사용해 텍스트 표시 */}
        <Text>Ghibli GraphQL</Text>
        <FilmList />
      </Box>
    </ChakraProvider>
  </ApolloProvider>
);
