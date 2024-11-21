// Apollo Client와 관련된 모듈을 import
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ChakraProvider, Box, Text, theme } from "@chakra-ui/react";
import * as React from "react";
import FilmList from "./components/film/FilmList";

// Apollo Client 인스턴스 생성
const apolloClient = new ApolloClient({
  // GraphQL 서버의 URI를 설정 (로컬에서 실행 중인 서버를 가리킴)
  uri: `${process.env.REACT_APP_API_HOST}/graphql`,
  // Apollo Client의 캐시 정책 설정 (InMemoryCache 사용)
  cache: new InMemoryCache(),
});

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
