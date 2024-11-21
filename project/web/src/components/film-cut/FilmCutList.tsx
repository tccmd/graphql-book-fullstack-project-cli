import {
  Box,
  Image,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
// GraphQL 쿼리를 불러오는 hook
import { useCutsQuery } from "../../generated/graphql";
// LazyLoad 컴포넌트를 import (이미지 로딩 최적화를 위해 사용)
import LazyLoad from "react-lazyload";

interface FilmCutListProps {
  filmId: number;
  onClick: (cutId: number) => void;
}

function FilmCutList({
  filmId,
  onClick,
}: FilmCutListProps): React.ReactElement {
  const { data, loading } = useCutsQuery({ variables: { filmId } });

  // 데이터가 로딩 중이면 스피너(로딩 표시)를 중앙에 보여줌
  if (loading) {
    return (
      <Box textAlign="center" my={10}>
        <Spinner />
      </Box>
    );
  }

  // 데이터가 로딩이 끝나면 SimpleGrid로 영화의 컷 이미지를 표시
  return (
    <SimpleGrid
      my={4} // 상하 여백 4(16px)
      columns={[1, 2, null, 3]} // 그리드의 열 개수를 지정. 배열 형태로 설정되었기 때문에 반응형으로 동작
      // 모바일, 태블릿, 이 값은 무시되며 특정 브레이크포인트에서도 별도 변경없이 이전 설정 유지, 데스크탑
      spacing={[2, null, 8]} // 그리드 항목들의 간격. 배열 형태로 설정되었기 때문에 반응형으로 동작
      // 모바일 (8px), 중간 화면 크기에서는 간격을 변경하지 않고 기존 값 유지, 데스크탑 (32px)
    >
      {data?.cuts.map((cut) => (
        // LazyLoad로 이미지를 감싸서 화면에 보일 때만 로딩하도록 최적화
        <LazyLoad height={200} once key={cut.id}>
          <LinkBox as="article">
            <Box>
              <LinkOverlay cursor="pointer" onClick={() => onClick(cut.id)}>
                <Image src={cut.src} />
                {/* 컷 이미지 표시 */}
              </LinkOverlay>
            </Box>
          </LinkBox>
        </LazyLoad>
      ))}
    </SimpleGrid>
  );
}

export default FilmCutList;
