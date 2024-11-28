// 이메일 유효성 검사를 위한 데코레이터와 문자열 유효성 검사를 위한 데코레이터를 class-validator에서 가져옴
import { IsEmail, IsString } from 'class-validator';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../entities/User';
// 비밀번호 해시화를 위한 argon2 라이브러리 전체를 불러옴
import {
  createAccessToken,
  createRefreshToken,
  REFRESH_JWT_SECRET_KEY,
  setRefreshTokenHeader,
} from '../utils/jwt-auth';
import { MyContext } from '../apollo/createApolloServer';
import { isAuthenticated } from '../middleweres/isAuthenticated';
// 파일을 저장할 때 필요
// import { createWriteStream } from 'fs';
// GraphQL 파일 업로드를 위해 필요한 타입과 스칼라(GraphQLUpload)
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { uploadImage } from '../utils/s3upload';

// GraphQL에서 입력으로 받을 데이터 구조를 정의하는 클래스
// 이 클래스는 GraphQL의 InputType으로 사용되며, 회원가입 요청 시 필요한 데이터를 정의함
@InputType()
export class SignUpInput {
  @Field() @IsEmail() email: string;

  @Field() @IsString() username: string;

  @Field() @IsString() password: string;
}

@InputType({ description: '로그인 인풋 데이터' })
export class LoginInput {
  @Field() @IsString() emailOrUsername: string;

  @Field() @IsString() password: string;
}

@ObjectType({ description: '필드 에러 타입' })
class FieldError {
  @Field() field: string;

  @Field() message: string;
}

@ObjectType({ description: '로그인 반환 데이터' })
class LoginResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  accessToken?: string;
}

@ObjectType({ description: '액세스 토큰 새로고침 반환 데이터' })
class RefreshAccessTokenResponse {
  @Field() accessToken: string;
}

@Resolver(User)
export class UserResolver {
  // 이 함수는 User 타입의 데이터를 반환함
  @Mutation(() => User)
  // UserResolver 클래스의 signUp 메서드, 위 데코레이터로 "User 타입을 반환하는 뮤테이션"으로 구현되었다.
  async signUp(@Arg('signUpInput') signUpInput: SignUpInput): Promise<User> {
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

  @Mutation(() => LoginResponse)
  public async login(
    @Arg('loginInput') loginInput: LoginInput,
    @Ctx() { res }: MyContext,
  ): Promise<LoginResponse> {
    // 입력받은 loginInput 데이터로부터 emailOrusername과 password를 가져온다.
    const { emailOrUsername, password } = loginInput;

    // 이후 데이터베이스에서 해당 email 또는 username을 가지는 유저 정보를 찾는다.
    const user = await User.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    if (!user)
      return {
        // 만약 유저를 못 찾는다면 FieldError의 배열을 반환한다.
        errors: [
          { field: 'emailOrUsername', message: '해당하는 유저가 없습니다.' },
        ],
      };

    // 유저를 찾았다면 argon2의 verify 함수를 이용해 가입 시 입력한 암호화된 비밀번호와 현재 로그인을 위해 입력된 비밀번호를 비교한다.
    // boolean 반환
    const isValid = await argon2.verify(user.password, password);
    // 틀린 비밀번호인 경우 FieldError 배열 반환
    if (!isValid)
      return {
        errors: [
          { field: 'password', message: '비밀번호를 올바르게 입력해주세요.' },
        ],
      };

    // 엑세스 토큰 발급
    const accessToken = createAccessToken(user);
    // 리프레시 토큰 발급
    const refreshToken = createRefreshToken(user);
    // 리프레시 토큰 MySQL에 저장
    await User.update(user.id, { refreshToken });

    // 쿠키로 리프레시 토큰 전송
    setRefreshTokenHeader(res, refreshToken);

    // 올바른 비밀번호인 경우 로그인이 완료되었으므로 user 정보를 반환
    return { user, accessToken };
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<User | null | undefined> {
    if (!ctx.verifiedUser) return null;
    return User.findOne({ where: { id: ctx.verifiedUser.userId } });
  }

  @Mutation(() => RefreshAccessTokenResponse, { nullable: true })
  async refreshAccessToken(
    @Ctx() { req, res }: MyContext,
  ): Promise<RefreshAccessTokenResponse | null> {
    console.log('UserResolver_refreshAccessToken 실행됨');
    // 요청 객체로 req로 부터 "refreshtoken" 쿠키값을 가져온다.
    const refreshToken = req.cookies.refreshtoken;
    // console.log("UserResolver_refreshAccessToken_refreshToken", refreshToken);

    // 해당 쿠키가 없을 경우 액세스 토큰을 재발급하지 않고 null 반환
    if (!refreshToken) return null;

    // 있는 경우
    let tokenData: any = null;
    try {
      // 해당 리프레시 토큰을 jwt.verify로 검증
      tokenData = jwt.verify(refreshToken, REFRESH_JWT_SECRET_KEY);
      // console.log("UserResolver_refreshAccessToken_tokenData", tokenData);
    } catch (e) {
      // 리프레시 토큰이 만료되었거나, 올바르지 못한 토큰이 전달되어 검증할 수 없다면 null 반환
      console.error(e);
      return null;
    }
    // 리프레시 토큰이 만료되었거나, 올바르지 못한 토큰이 전달되어 검증할 수 없다면 null 반환
    if (!tokenData) return null;

    // MySQL에서 해당 유저의 리프레시 토큰을 가져옴
    const user = await User.findOne({ where: { id: tokenData.userId } });
    if (!user) return null;

    // DB에 저장된 리프레시 토큰과 비교
    if (user.refreshToken !== refreshToken) return null;

    // 여기까지의 과정(리프래시 토큰 쿠키값 존재, 검증된 토큰, MySQL에 userId로 저장된 값 존재, 레디스 값과 전송된 리프레시 토큰 같음, DB에 User 존재)을 모두 통과한 경우
    // 새로 발급할 액세스 및 리프레시 토큰 생성
    const newAccessToken = createAccessToken(user); // 액세스 토큰 생성
    const newRefreshToken = createRefreshToken(user); // 리프레시 토큰 생성
    // MySQL에 새로운 리프레시 토큰 저장 (기존 기록 업데이트)
    // 새로운 리프레시 토큰을 DB에 저장
    await User.update(user.id, { refreshToken });

    // 쿠키로 새로 발급한 리프레시 토큰 전송
    res.cookie('refreshtoken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    // 새롭게 발급한 액세스 토큰 반환
    return { accessToken: newAccessToken };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async logout(@Ctx() { verifiedUser, res }: MyContext): Promise<boolean> {
    if (verifiedUser) {
      setRefreshTokenHeader(res, ''); // 리프레시 토큰 쿠키 제거
      // 2. MySQL에서 해당 유저의 refreshToken 제거 (null로 업데이트)
      await User.update(verifiedUser.userId, { refreshToken: '' }); // MySQL 토큰 제거
    }
    return true; // 성공적으로 로그아웃 처리
  }

  // @UseMiddleware(isAuthenticated)
  // @Mutation(() => Boolean)
  // async uploadProfileImage(
  //   @Ctx() { verifiedUser }: MyContext,
  //   @Arg('file', () => GraphQLUpload)
  //   { createReadStream, filename }: FileUpload,
  // ): Promise<boolean> {
  //   // const realFileName = verifiedUser?.userId + filename;
  //   // const filePath = `public/${realFileName}`;

  //   // return new Promise((resolve, reject) =>
  //   //   createReadStream()
  //   //     .pipe(createWriteStream(filePath))
  //   //     .on('finish', async () => {
  //   //       await User.update(
  //   //         { id: verifiedUser?.userId },
  //   //         { profileImage: realFileName },
  //   //       );
  //   //       return resolve(true);
  //   //     })
  //   //     .on('error', () => reject(Error('file upload failed'))),
  //   // );
  // }
  @UseMiddleware(isAuthenticated)
  @Mutation(() => Boolean)
  async uploadProfileImage(
    @Ctx() { verifiedUser }: MyContext,
    @Arg('file', () => GraphQLUpload) file: FileUpload
  ): Promise<boolean> {
    // 유저 ID와 파일명을 조합하여 파일 이름 지정
    // const realFileName = `${verifiedUser?.userId}-${file.filename}`;


    // S3에 파일 업로드
    try {
      const fileUrl = await uploadImage(file);  // S3 업로드 함수 호출
      console.log('File URL:', fileUrl);

      // 업로드된 파일 URL을 User 엔티티에 저장
      await User.update(
        { id: verifiedUser?.userId },
        { profileImage: file.filename }
      );

      return true;  // 성공적으로 파일 업로드 및 데이터베이스 업데이트
    } catch (err) {
      console.error('Error in file upload:', err);
      return false;  // 업로드 실패
    }
  }
}