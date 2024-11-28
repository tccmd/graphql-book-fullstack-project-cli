import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { FilmResolver } from '../resolvers/Film';
import { CutResolver } from '../resolvers/Cut';
import { UserResolver } from '../resolvers/User';
import { PubSub } from 'graphql-subscriptions';
import { CutReviewResolver } from '../resolvers/CurReview';

const pubSub = new PubSub();

export const createSchema = async (): Promise<GraphQLSchema> => {
  return buildSchema({
    resolvers: [FilmResolver, CutResolver, UserResolver, CutReviewResolver],
    pubSub: pubSub as any,
  });
};
