import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@ObjectType() // type-graphql
@Entity() // typeorm
export default class Token extends BaseEntity {
  @Field(() => Int, { description: "유저 ID" })
  @PrimaryColumn() // typeorm
  userId: number;

  @Field({ description: "리프레시 토큰 값" })
  @Column({ comment: "유저의 리프레시 토큰 값" }) // typeorm
  refreshToken: string;
}
