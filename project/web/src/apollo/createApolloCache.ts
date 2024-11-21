import { InMemoryCache } from "@apollo/client";
import { PaginatedFilms } from "../generated/graphql";

// Apollo Client에서 사용할 InMemoryCache를 생성하는 함수
export const createApolloCache = (): InMemoryCache => {
  // 새로운 InMemoryCache 객체를 생성하고 반환
  return new InMemoryCache({
    // typePolicies는 Apollo Client가 캐시를 관리하는 방식에 대한 규칙을 정의
    typePolicies: {
      // Query 필드에 대한 규칙을 정의
      Query: {
        fields: {
          // films 필드에 대한 캐싱 및 병합 정책을 설정
          films: {
            // keyArgs를 false로 설정하면, 모든 인자가 동일한 필드로 간주되어 병합 대상이 됨
            keyArgs: false,
            // 병합 정책을 정의하는 merge 함수
            merge: (
              existing: PaginatedFilms | undefined, // 기존 캐시에 있는 데이터 (없을 수도 있음)
              incoming: PaginatedFilms // 새로 들어온 데이터
            ): PaginatedFilms => {
              // 캐시 병합 시 기존 데이터와 새 데이터를 결합하여 반환
              return {
                cursor: incoming.cursor, // 새로운 데이터를 가져올 수 있도록 cursor를 업데이트
                films: existing
                  ? [...existing.films, ...incoming.films] // 기존 영화 목록과 새로 들어온 영화 목록을 합침
                  : incoming.films, // 기존 데이터가 없으면 새 데이터를 바로 사용
              };
            },
          },
        },
      },
    },
  });
};
