import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Cut } from "../entities/Cut";
import { Film } from "../entities/Film";
import ghibliData from "../data/ghibli";
import { isAuthenticated } from "../middleweres/isAuthenticated";
import { MyContext } from "../apollo/createApolloServer";
import { CutVote } from "../entities/CutVote";

@Resolver(Cut)
export class CutResolver {
  @Query(() => [Cut])
  cuts(@Arg("filmId", () => Int) filmId: Film["id"]): Cut[] {
    return ghibliData.cuts.filter((x) => x.filmId === filmId);
  }

  @Query(() => Cut, { nullable: true })
  cut(@Arg("cutId", () => Int) cutId: number): Cut | undefined {
    return ghibliData.cuts.find((x) => x.id === cutId);
  }

  @FieldResolver(() => Film, { nullable: true })
  film(@Root() cut: Cut): Film | undefined {
    return ghibliData.films.find((film) => film.id === cut.filmId);
  }

  // + DB
  @Mutation(() => Boolean)
  // 로그인되어 있는 경우에만 좋아요 기능이 가능하도록 만들기 위해 미들웨어 사용
  @UseMiddleware(isAuthenticated)
  async vote(
    @Arg("cutId", () => Int) cutId: number,
    @Ctx() { verifiedUser }: MyContext
  ): Promise<boolean> {
    // 로그인 된 유저 정보
    if (verifiedUser) {
      const { userId } = verifiedUser;
      const aleadyVoted = await CutVote.findOne({
        where: { cutId, userId },
      });
      if (aleadyVoted) {
        // 이미 좋아요가 되어있는 경우 CutVote 제거
        await aleadyVoted.remove();
        return true;
      }
      const vote = CutVote.create({ cutId, userId });
      await vote.save();
      return true;
    }
    return false;
  }

  @FieldResolver(() => Int)
  // @Root() 데코레이터로 votesCount 필드 리졸버의 상위 타입인 Cut을 가져옴
  async votesCount(
    @Root() cut: Cut,
    @Ctx() { cutVoteLoader }: MyContext
  ): Promise<number> {
    const cutVotes = await cutVoteLoader.load({ cutId: cut.id });
    return cutVotes.length;
  }

  @FieldResolver(() => Boolean)
  async isVoted(
    @Root() cut: Cut,
    @Ctx() { cutVoteLoader, verifiedUser }: MyContext
  ): Promise<boolean> {
    // 검증된 유저일 경우
    if (verifiedUser) {
      // 명장면에 좋아요 표시를 한 적이 있는지 확인
      // cutVotedLoader를 통해 요정된 명장면에 대한 좋아요 목록을 가져옴
      const votes = await cutVoteLoader.load({ cutId: cut.id });
      console.log("Resolver_Cut_FieldResolver_isVoted_votes :", votes);
      // 현재 유저가 표시한 좋아요가 있는지를 확인하여 있는 경우 true 반환
      if (votes.some((vote) => vote.userId === verifiedUser.userId))
        return true;
      // 그렇지 않은 경우 false 반환
      return false;
    }
    // 검증되지 않은 유저 - false 반환
    return false;
  }
}
