// Apollo Client와 관련된 모듈을 import
import { ApolloProvider } from "@apollo/client";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { createApolloClient } from "./apollo/createApolloClient";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Film from "./pages/Film";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

// Apollo Client 인스턴스 생성
const apolloClient = createApolloClient();

// React 컴포넌트 정의
export const App = () => (
  // ApolloProvider로 앱 전체에 Apollo Client를 제공
  <ApolloProvider client={apolloClient}>
    {/* ChakraProvider로 앱 전체에 Chakra UI 테마를 적용 */}
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/film/:filmId" element={<Film />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </ApolloProvider>
);
