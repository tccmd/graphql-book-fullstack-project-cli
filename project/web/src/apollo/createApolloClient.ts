import {
  ApolloClient,
  from,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { createApolloCache } from "./createApolloCache";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";

// Apollo 링크 - onError 링크
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: -> ${operation.operationName}
        Message: ${message}, Query: ${path}, Location: ${JSON.stringify(
          locations
        )}
        `
      );
    });
  }
  if (networkError) {
    console.log(`[networkError]: -> ${operation.operationName}
      Message: ${networkError.message}
      `);
  }
});

// Apollo 링크 - HttpLink: HTTP 통신을 통해 각 GraphQL 요청을 서버로 보내기 위한 노드
const httpLink = new HttpLink({
  uri: `${process.env.REACT_APP_API_HOST}/graphql`,
  credentials: "include",
});

// Apollo 링크 - 헤더로 엑세스 토큰을 지정해주는 작업을 실행하는 링크
const authLink = setContext((req, prevContext) => {
  const accessToken = localStorage.getItem("access_token");
  return {
    headers: {
      ...prevContext.headers,
      // JWT를 통한 인증을 진행하는 경우에는 Bearer 타입을 사용한다.
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  };
});

export const createApolloClient = (): ApolloClient<NormalizedCacheObject> =>
  // Apollo Client 인스턴스 생성
  new ApolloClient({
    // GraphQL 서버의 URI를 설정 (로컬에서 실행 중인 서버를 가리킴)
    uri: `${process.env.REACT_APP_API_HOST}/graphql`,
    // Apollo Client의 캐시 정책 설정
    cache: createApolloCache(),
    link: from([errorLink, authLink, httpLink]),
  });
