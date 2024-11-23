// 이메일 유효성 검사를 위한 데코레이터와 문자열 유효성 검사를 위한 데코레이터를 class-validator에서 가져옴
import { IsEmail, IsString } from "class-validator";
import { Arg, Field, InputType, Mutation, Resolver } from "type-graphql";
import User from "../entities/User";
// 비밀번호 해시화를 위한 argon2 라이브러리 전체를 불러옴
import * as argon2 from "argon2";

// GraphQL에서 입력으로 받을 데이터 구조를 정의하는 클래스
// 이 클래스는 GraphQL의 InputType으로 사용되며, 회원가입 요청 시 필요한 데이터를 정의함
@InputType()
export class SignUpInput {
  @Field() @IsEmail() email: string;

  @Field() @IsString() username: string;

  @Field() @IsString() password: string;
}

@Resolver(User)
export class UserResolver {
  // 이 함수는 User 타입의 데이터를 반환함
  @Mutation(() => User)
  // UserResolver 클래스의 signUp 메서드, 위 데코레이터로 "User 타입을 반환하는 뮤테이션"으로 구현되었다.
  async signUp(@Arg("signUpInput") signUpInput: SignUpInput): Promise<User> {
    // "signUp 뮤테이션"은 signUpInput이라는 파라미터 변수를 받도록 @Arg() 데코레이터를 통해 설정했다. signUpInput은 nullable이 아니므로, signUp 뮤테이션 요청 시 언제나 필요한 필수 파라미터이다.
    // 클라이언트가 보낸 이메일, 유저네임, 비밀번호를 signUpInput에서 추출
    const { email, username, password } = signUpInput;

    // 비밀번호를 argon2 라이브러리로 해시화 // 단방향 암호화 처리
    const hashedPw = await argon2.hash(password);

    // User 엔터티의 인스턴스를 생성하고, 해시화된 비밀번호를 포함한 유저 정보를 설정
    const newUser = User.create({
      email,
      username,
      password: hashedPw,
    });

    // 새로 생성된 유저 정보를 데이터베이스에 삽입
    await User.insert(newUser);

    // 새로 생성된 유저 객체를 반환 (GraphQL 응답으로 클라이언트에게 전달됨)
    return newUser;
  }
}
