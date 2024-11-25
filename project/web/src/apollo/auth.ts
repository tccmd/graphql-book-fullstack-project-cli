import { ApolloClient, NormalizedCacheObject, Operation } from "@apollo/client";
import {
  RefreshAccessTokenMutation,
  RefreshAccessTokenDocument,
} from "../generated/graphql";

// arg: ApolloClient, Operation from @apollo/client
// Operation: link마다 전달되는 GraphQL 요청에 대한 정보를 담고 있다.
export const refreshAccessToken = (
  _apolloClient: ApolloClient<NormalizedCacheObject>,
  operation: Operation
): Promise<boolean> =>
  // apolloClient의 mutate 함수로 뮤테이션 요청
  _apolloClient
    .mutate<RefreshAccessTokenMutation>({
      // mutation 옵션에 codegen을 통해 만들어낸 뮤테이션 요청 문자열인 RefreshAccessTokenDocument 사용
      mutation: RefreshAccessTokenDocument,
    })
    .then(({ data }) => {
      const newAccessToken = data?.refreshAccessToken?.accessToken;
      // 새로 발급된 액세스 토큰이 응답되지 않은 경우 기존 액세스 토큰은 유효하지 않은 것이고,
      // 리프레시 토큰을 통해 재발급도 불가능한 상태이므로 localStorage의 access_token 제거
      if (!newAccessToken) {
        localStorage.setItem("access_token", "");
        return false;
      }
      // 새로 발급된 액세스 토큰이 응답된 경우, localStorage의 access_token값을 새로 발급된 토큰으로 변경하고
      localStorage.setItem("access_token", newAccessToken);
      // operation의 getContext() 함수와 setContext() 함수를 통해 authLink에서와 같이 authorization 헤더에 새로운 액세스 토큰이 설정되도록 구성
      const prevContext = operation.getContext();
      operation.setContext({
        headers: {
          ...prevContext.headers,
          authorization: `Bearer ${newAccessToken}`,
        },
      });
      return true;
    })
    .catch(() => {
      localStorage.setItem("access_token", "");
      return false;
    });
