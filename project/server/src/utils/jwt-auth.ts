import jwt from "jsonwebtoken";
import User from "../entities/User";
import { AuthenticationError } from "apollo-server-express";
import { IncomingHttpHeaders } from "http";
import { Response } from "express";

export const DEFAUT_JWT_SECRET_KEY = "secret-key";
export const REFRESH_JWT_SECRET_KEY = "secret-key2";

export interface JwtVerifiedUser {
  userId: User["id"];
}

// 엑세스 토큰 발급
export const createAccessToken = (user: User): string => {
  const userData: JwtVerifiedUser = { userId: user.id };
  const accessToken = jwt.sign(
    userData,
    process.env.JWT_SECRET_KEY || "secret-key",
    { expiresIn: "30m" }
  );
  return accessToken;
};

// 액세스 토큰 검증
// accessToken 문자열을 인자로 받는다
export const verifyAccessToken = (
  accessToken?: string
): JwtVerifiedUser | null => {
  // 액세스 토큰이 없다면 null 반환
  if (!accessToken) return null;
  // 있으면 jwt.verify 함수를 통해 검증 및 디코딩
  try {
    // 올바른 토큰일 경우 토큰 생성 시 입력한 데이터를 그대로 반환, JwtVerifiedUser 타입으로 데이터를 반환
    const verified = jwt.verify(
      accessToken,
      process.env.JWT_SECRET_KEY || DEFAUT_JWT_SECRET_KEY
    ) as JwtVerifiedUser;
    return verified;
  } catch (err) {
    console.error("access_token expired: ", err);
    // 토큰이 만료되었거나, 알 수 없는 토큰일 경우 에러를 일으킨다.
    throw new AuthenticationError("access token expired");
  }
};

// req.headers로부터 액세스 토큰 검증
export const verifyAccessTokenFromReqHeaders = (
  headers: IncomingHttpHeaders
): JwtVerifiedUser | null => {
  // 요청 객체의 headers 필드에 Authorization 헤더가
  const { authorization } = headers;
  // 없다면 null 반환
  if (!authorization) return null;

  const accessToken = authorization.split(" ")[1];
  try {
    // verifyAccessToken 함수 실행
    return verifyAccessToken(accessToken);
  } catch {
    // 토큰 검증에 실패해 에러가 발생한 경우 null 반환
    return null;
  }
};

// 리프레시 토큰 발급
export const createRefreshToken = (user: User): string => {
  const userData: JwtVerifiedUser = { userId: user.id };
  return jwt.sign(
    userData,
    process.env.JWT_REFRESH_SECRET_KEY || REFRESH_JWT_SECRET_KEY,
    { expiresIn: "14d" }
  );
};

// 리프레시 토큰 헤더
export const setRefreshTokenHeader = (
  res: Response,
  refreshToken: string
): void => {
  // rex.cookie 함수를 통해 응답에서 쿠키를 함께 전송하도록 구성
  // 쿠키 이름 'refreshtoken'
  // 발급한 리플시 토큰이 데이터로 설정되도록 함
  res.cookie("refreshtoken", refreshToken, {
    // 자바스크립트 코드로 이 토큰에 접근할 수 없도록 httpOnly 옵션 설정
    httpOnly: true,
    // 프로덕션 환경의 경우 https 프로토콜에서만 동작하도록 secure 옵션 구성
    secure: process.env.NODE_ENV === "production",
    // secure: true,
    // 사이트 내 요청만 허용하도록 구성
    sameSite: "lax",
    // sameSite: "none", // 크로스-도메인 요청 허용
    // domain: ".tccmd.site",
  });
};
