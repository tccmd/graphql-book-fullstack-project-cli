import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";

@ObjectType()
@Entity()
export class CutReview extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "감상평 내용" })
  @Field({ description: "감상평 내용" })
  contents: string;

  @Column({ comment: "명장면 번호" })
  @Field(() => Int, { description: "명장면 번호" })
  cutId: number;

  @ManyToOne(
    () => User,
    (user) => {
      user.cutReviews;
    }
  )
  @Field(() => User)
  user: User;

  @RelationId((cutReview: CutReview) => cutReview.user)
  userId: number;

  @CreateDateColumn({ comment: "생성 일자" })
  @Field(() => String, { description: "생성 일자" })
  createdAt: Date;

  @UpdateDateColumn({ comment: "수정 일자" })
  @Field(() => String, { description: "수정 일자" })
  updatedAt: Date;
}
