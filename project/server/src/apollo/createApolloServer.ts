import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { FilmResolver } from "../resolvers/Film";
import { CutResolver } from "../resolvers/Cut";
import { UserResolver } from "../resolvers/User";
import { Request, Response } from "express";
import {
  JwtVerifiedUser,
  verifyAccessTokenFromReqHeaders,
} from "../utils/jwt-auth";
import { createCutVoteLoader } from "../dataloaders/cutVoteLoader";

export interface MyContext {
  req: Request;
  res: Response;
  verifiedUser: JwtVerifiedUser;
  // cutVoteLoader 필드 추가, ReturnType이라는 유틸리티 타입을 사용해 cutVoteLoader의 반환값을 갖도록 구성
  cutVoteLoader: ReturnType<typeof createCutVoteLoader>;
}

const createApolloServer = async (): Promise<ApolloServer> => {
  return new ApolloServer<MyContext>({
    schema: await buildSchema({
      resolvers: [FilmResolver, CutResolver, UserResolver],
    }),
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
    context: ({ req, res }) => {
      const verified = verifyAccessTokenFromReqHeaders(req.headers);
      return {
        req,
        res,
        verifiedUser: verified,
        cutVoteLoader: createCutVoteLoader(),
      };
    },
  });
};

export default createApolloServer;
