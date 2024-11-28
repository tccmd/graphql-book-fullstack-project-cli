import {
  ApolloClient,
  from,
  fromPromise,
  NormalizedCacheObject,
} from '@apollo/client';
import { createApolloCache } from './createApolloCache';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { refreshAccessToken } from './auth';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
let apolloClient: ApolloClient<NormalizedCacheObject>;

export const initializeApolloClient = () => {
  // 디버깅: 클라이언트 초기화 상태 확인
  if (!apolloClient) {
    console.log('Initializing new Apollo Client...');
    apolloClient = createApolloClient();
  }
  return apolloClient;
};

// Apollo 링크 - onError 링크
const errorLink = onError(
  // eslint-disable-next-line consistent-return
  ({ graphQLErrors, networkError, operation, forward }) => {
    // 디버깅: 에러 종류 확인
    console.log('Error link triggered:');
    if (graphQLErrors) {
      console.log('GraphQL Errors:', graphQLErrors);

      if (graphQLErrors.find((err) => err.message === 'access token expired')) {
        console.log('Access token expired. Attempting to refresh the token...');

        const client = initializeApolloClient(); // 클라이언트 초기화

        return fromPromise(refreshAccessToken(client, operation))
          .filter((result) => {
            console.log('Token refresh result:', result);
            return !!result;
          })
          .flatMap(() => {
            console.log('Retrying operation after token refresh...');
            return forward(operation);
          });
      }

      graphQLErrors.forEach(({ message, locations, path }) =>
        // eslint-disable-next-line no-console
        console.log(
          `[GraphQL error]: -> ${operation.operationName} 
        Message: ${message}, Query: ${path}, Location: ${JSON.stringify(
            locations,
          )}`,
        ),
      );
    }

    if (networkError) {
      // eslint-disable-next-line no-console
      console.log(`[networkError]: -> ${operation.operationName}
    Message: ${networkError.message}`);
    }
  },
);

// Apollo 링크 - HttpLink: HTTP 통신을 통해 각 GraphQL 요청을 서버로 보내기 위한 노드
// const httpLink = new HttpLink({
//   uri: `${process.env.REACT_APP_API_HOST}/graphql`,
//   credentials: 'include',
// });
const httpUploadLink = createUploadLink({
  uri: `${process.env.REACT_APP_API_HOST}/graphql`,
  credentials: 'include',
});

// Apollo 링크 - 헤더로 엑세스 토큰을 지정해주는 작업을 실행하는 링크
const authLink = setContext((req, prevContext) => {
  const accessToken = localStorage.getItem('access_token');
  console.log('Auth link triggered. Access token:', accessToken);
  return {
    headers: {
      ...prevContext.headers,
      // JWT를 통한 인증을 진행하는 경우에는 Bearer 타입을 사용한다.
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

export const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  console.log('Creating Apollo Client...');
  apolloClient = new ApolloClient({
    // GraphQL 서버의 URI를 설정 (로컬에서 실행 중인 서버를 가리킴)
    // uri: `${process.env.REACT_APP_API_HOST}/graphql`,
    // Apollo Client의 캐시 정책 설정
    cache: createApolloCache(),
    link: from([errorLink, authLink, httpUploadLink as any]),
  });

  // 디버깅: Apollo Client 설정 확인
  console.log('Apollo Client created with configuration:', {
    cache: apolloClient.cache,
    link: apolloClient.link,
  });

  return apolloClient;
};
