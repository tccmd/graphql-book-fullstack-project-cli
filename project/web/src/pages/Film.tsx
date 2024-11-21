import { useParams } from "react-router-dom";
import CommonLayout from "../components/CommonLayout";
import { useFilmQuery } from "../generated/graphql";
import { Box, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import FilmDetail from "../components/film/FilmDetail";
import FilmCutList from "../components/film-cut/FilmCutList";
import { useState } from "react";
import FilmCutModal from "../components/film-cut/FilmCutModal";

function Film(): React.ReactElement {
  const { filmId } = useParams<{ filmId: string }>();
  const { data, loading, error } = useFilmQuery({
    variables: { filmId: Number(filmId) },
  });

  // 이 hook은 Chakra-UI에서 제공하는 편의를 위한 훅으로, 모달 창과 같이 열고 닫는 기능이 필요한 컴포넌트의 상태를 쉽게 활용할 수 있도록 구성되어 있다.
  // 열림/닫힘 상태를 나타내는 boolean 값 isOpen과 isOpen 상태를 true로 변경하는 onOpen 그리고 isOpen 상태를 false로 변경하는 onClose 등을 반환한다.
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectdCutId, setSelectedCutId] = useState<number>();
  // <FilmCutList />에서 각 명장면을 클릭할 때 selectedCutId를 변경함과 동시에 모달 창을 열림 상태로 변경하는 클릭 핸들러
  const handleCutSelect = (cutId: number) => {
    setSelectedCutId(cutId); // cut id
    onOpen(); // modal open
  };

  return (
    <CommonLayout>
      {/* 로딩 중일 때 Spinner(로딩 표시)를 보여줌 */}
      {loading && <Spinner />}

      {/* 오류가 발생하면 에러 메세지를 보여줌 */}
      {error && <Text>페이지를 표시할 수 없습니다.</Text>}

      {/* 영화 데이터가 있을 경우, FilmDetail과 FilmCutList를 렌더링 */}
      {filmId && data?.film ? (
        <>
          {/* 영화 상세 정보를 보여줌 */}
          <FilmDetail film={data.film} />
          <Box mt={12}>
            {/* 영화의 컷 리스트를 보여줌, 컷을 클릭하면 handleCutSelect를 실행 */}
            <FilmCutList filmId={data.film.id} onClick={handleCutSelect} />
          </Box>
        </>
      ) : (
        // 영화 데이터가 없으면 오류 메세지를 표시
        <Text>페이지를 표시할 수 없습니다.</Text>
      )}

      {/* 선택된 컷 ID가 있을 때만 모달 창을 띄움 */}
      {!selectdCutId ? null : (
        <FilmCutModal open={isOpen} onClose={onClose} cutId={selectdCutId} />
      )}
    </CommonLayout>
  );
}

export default Film;
