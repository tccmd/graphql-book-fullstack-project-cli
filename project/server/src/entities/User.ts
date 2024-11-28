import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CutVote } from "./CutVote";
import { CutReview } from "./CutReview";
import Notification from "./Notification";

@ObjectType() // type-graphql
@Entity() // typeorm
export default class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn() // typeorm
  id!: number;

  @Field({ description: "유저 이름" })
  @Column({ unique: true, comment: "유저 이름" }) // typeorm
  username: string;

  @Field({ description: "유저 이메일 " })
  @Column({ unique: true, comment: "유저 이메일" }) // typeorm
  email: string;

  @Column({ comment: "비밀번호" }) // typeorm
  password: string;

  @Field(() => String, { description: "생성 일자" })
  @CreateDateColumn({ comment: "생성 일자" }) // typeorm
  createdAt: Date;

  @Field(() => String, { description: "업데이트 일자" })
  @UpdateDateColumn({ comment: "업데이트 일자" }) // typeorm
  updatedAt: Date;

  @Column({ nullable: true })
  refreshToken: string; // 리프레시 토큰 필드 추가

  @OneToMany(() => CutVote, (cutVote) => cutVote.user)
  cutVotes: CutVote[];

  @OneToMany(() => CutReview, (cutReview) => cutReview.user)
  cutReviews: CutReview[];

  @Column({ comment: "프로필 사진 경로", nullable: true })
  @Field({ description: "프로필 사진 경로", nullable: true })
  profileImage: string;

  @OneToMany(() => Notification, (noti) => noti.user)
  notifications: Notification[];
}
