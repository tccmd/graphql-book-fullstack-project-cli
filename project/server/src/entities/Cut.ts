import { Field, Int, ObjectType } from "type-graphql";

// Cut 타입 생성
@ObjectType()
export class Cut {
  @Field(() => Int, { description: "명장면 고유 아이디" })
  id: number;

  @Field({ description: "명장면 사진 주소" })
  src: string;

  @Field(() => Int, { description: "영화 아이디" })
  filmId: number;
}
