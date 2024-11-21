import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { createApolloCache } from "./createApolloCache";

export const createApolloClient = (): ApolloClient<NormalizedCacheObject> =>
  // Apollo Client 인스턴스 생성
  new ApolloClient({
    // GraphQL 서버의 URI를 설정 (로컬에서 실행 중인 서버를 가리킴)
    uri: `${process.env.REACT_APP_API_HOST}/graphql`,
    // Apollo Client의 캐시 정책 설정
    cache: createApolloCache(),
  });
