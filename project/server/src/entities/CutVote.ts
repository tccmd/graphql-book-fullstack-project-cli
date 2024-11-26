import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Cut } from "./Cut";
import User from "./User";

@Entity()
@ObjectType()
// 데이터 테이블이면서 동시에 GraphQL 오브젝트 타입
export class CutVote extends BaseEntity {
  @PrimaryColumn()
  @Field(() => Int)
  userId: number;

  @PrimaryColumn()
  @Field(() => Int)
  cutId: number;

  // 데이터베이스 컬럼으로 구성하지 않고, GraphQL 필드로만 구성
  @Field(() => Cut)
  cut: Cut;

  @Field(() => User)
  // 관계 데이터 "유저"와 "좋아요"는 일대다 관계를 가진다.
  @ManyToOne(() => User, (user) => user.cutVotes)
  user: User;
}
