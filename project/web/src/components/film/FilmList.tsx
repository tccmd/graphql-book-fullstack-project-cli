import { Box, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { useFilmsQuery } from "../../generated/graphql"; // GraphQL로 자동 생성된 useFilmsQuery를 가져옴
import FilmCard from "./FilmCard"; // 개별 영화 정보를 보여줄 FilmCard 컴포넌트를 가져옴
import { Waypoint } from "react-waypoint";

// FilmList 컴포넌트는 영화 목록을 보여줌
export default function FilmList(): JSX.Element {
  // useFilmsQuery를 호출하여 영화 데이터를 불러옴. 로딩 상태, 에러, 데이터를 반환함
  const LIMIT = 6;
  const { data, loading, error, fetchMore } = useFilmsQuery({
    variables: {
      limit: LIMIT,
      cursor: 1,
    },
  });

  // 에러가 발생하면 에러 메시지를 출력
  if (error) return <p>{error.message}</p>;

  // SimpleGrid는 그리드 레이아웃을 생성, 열 수를 반응형으로 설정 (기본 2열, 큰 화면에서는 3열)
  return (
    <SimpleGrid columns={[2, null, 3]} spacing={[2, null, 10]}>
      {/* 로딩 중일 때는 6개의 Skeleton(로딩 중임을 보여주는 뼈대 UI)을 출력 */}
      {loading &&
        new Array(6)
          .fill(0)
          .map((_, index) => <Skeleton key={index} height="400px" />)}

      {/* 로딩이 끝나고 데이터가 존재할 때, 영화 데이터를 반복하여 FilmCard 컴포넌트에 전달 */}
      {!loading &&
        data &&
        data.films.films.map((film, i) => (
          <Box key={film.id}>
            {data.films.cursor && i === data.films.films.length - LIMIT / 2 && (
              <Waypoint
                onEnter={() => {
                  fetchMore({
                    variables: {
                      limit: LIMIT,
                      cursor: data.films.cursor,
                    },
                  });
                }}
              />
            )}
            <FilmCard film={film} />
            {/* 각 영화 정보를 FilmCard 컴포넌트에 전달 */}
          </Box>
        ))}
    </SimpleGrid>
  );
}
