import DataLoader from "dataloader";
import { Cut } from "../entities/Cut";
import { CutVote } from "../entities/CutVote";
import { In } from "typeorm";

// cutId의 타입을 Cut 엔티티에서 가져온다.
type CutVoteKey = {
  cutId: Cut["id"];
};

// <CutVoteKey, CutVote[]>
//  첫 번째 타입 인자: DataLoader가 요청을 받을 때 사용하는 "키" 타입 정의 { cutId: number } CutVoteKey 객체
//  두 번째 타입 인자: DataLoader가 반환할 "값"의 타입 정의 각 CutVoteKey에 해당하는 CutVote 객체의 배열
export const createCutVoteLoader = (): DataLoader<CutVoteKey, CutVote[]> => {
  // 비동기 함수로 keys 받아 처리, DataLoader는 주어진 keys를 한 번에 처리하기 위해 keys 배열을 비동기적으로 받아온다.
  return new DataLoader<CutVoteKey, CutVote[]>(async (keys) => {
    console.log("keys: ", keys);
    // cutId 배열 생성 예를 들어 keys가 [{ cutId:1 }, { cutId: 2}]라면 cutIds는 [1, 2]가 된다.
    const cutIds = keys.map((key) => key.cutId);
    console.log("cutId 배열 생성 cutIds: ", cutIds);
    // CutVote 엔티티 찾기
    // cutId가 cutIds 배열에 포함된 모든 CutVote를 가져온다. In 키워드를 사용해 여러 개의 cutId를 한 번에 조회할 수 있다.
    const votes = await CutVote.find({ where: { cutId: In(cutIds) } });
    console.log("CutVote 엔티티 찾기 votes: ", votes);
    // 결과 매핑
    // keys의 각 cutId에 해당하는 CutVote 배열을 만들기 위해 vote.filter() 사용
    const result = keys.map((key) =>
      votes.filter((vote) => vote.cutId === key.cutId)
    );
    console.log("결과 매핑 result: ", result);
    return result;
  });
};
