import {
  Query,
  Resolver,
  ObjectType,
  Field,
  Int,
  Arg,
  FieldResolver,
  Root,
} from "type-graphql";
import ghibliData from "../data/ghibli";
import { Film } from "../entities/Film";
import { Director } from "../entities/Director";

// 페이지 처리된 영화 목록 반환 오브젝트 타입
@ObjectType()
class PaginatedFilms {
  @Field(() => [Film])
  films!: Film[];

  @Field(() => Int, { nullable: true })
  cursor?: Film["id"] | null;
}

@Resolver(Film)
export class FilmResolver {
  @Query(() => PaginatedFilms)
  films(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 6 }) limit: number,
    @Arg("cursor", () => Int, { nullable: true, defaultValue: 1 })
    cursor: Film["id"]
  ): PaginatedFilms {
    // 너무 많은 limit 값은 6으로 제한
    const realLimit = Math.min(6, limit);

    // 커서가 없는 경우 빈 배열 전송
    if (!cursor) return { films: [] };

    const cursorDataIndex = ghibliData.films.findIndex((f) => f.id === cursor);
    // 올바르지 않은 커서인 경우 초기값 전송
    if (cursorDataIndex === -1) return { films: [] };

    const result = ghibliData.films.slice(
      cursorDataIndex,
      cursorDataIndex + realLimit
    );
    // 다음 커서 생성
    const nextCursor = result[result.length - 1].id + 1;
    // 다음 커서가 유효한지 확인
    const hasNext = ghibliData.films.findIndex((f) => f.id === nextCursor) > -1;

    return {
      cursor: hasNext ? nextCursor : null,
      films: result,
    };
  }

  @FieldResolver(() => Director)
  director(@Root() parentFilm: Film): Director | undefined {
    return ghibliData.directors.find((dr) => dr.id === parentFilm.director_id);
  }

  @Query(() => Film, { nullable: true })
  film(@Arg('filmId', () => Int) filmId: number): Film | undefined {
    return ghibliData.films.find((x) => x.id === filmId)
  }
}
