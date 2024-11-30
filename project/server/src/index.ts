import 'reflect-metadata';
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import createApolloServer from './apollo/createApolloServer';
import { createDB } from './db/db-client';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { createSchema } from './apollo/createSchema';
import { createHandler } from 'graphql-sse/lib/use/express';

// .env 파일에서 작성한 모든 환경변수는 process.env에 주입되었다.
dotenv.config();

async function main() {
  const schema = await createSchema();
  // Create the GraphQL over SSE handler
  const handler = createHandler({ schema });
  const app = express();
    app.use(cookieParser());
    app.use(
      graphqlUploadExpress({
        maxFieldSize: 1024 * 1000 * 5,
        maxFiles: 1,
      }),
    );
  const httpServer = http.createServer(app);
  // Serve all methods on `/graphql/stream`
  app.use('/graphql/stream', handler);


  app.get('/', (req, res) => {
    res.status(200).send(); // for health check
    console.log('success');
  });


  const apolloServer = await createApolloServer(schema);
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: {
      // 아폴로 스튜디오를 GraphQL 테스트 용도로 활용하기 위해 https://studio.apollographql.com도 허용하도록 구성
      origin: [
        'http://localhost:3000',
        'https://studio.apollographql.com',
        'http://ghibli-graphql-cli-bucket.s3-website.ap-northeast-2.amazonaws.com',
        'http://ghibli-graphql-cli-vercel-bucket.s3-website.ap-northeast-2.amazonaws.com',
        'https://web-ashy-alpha.vercel.app',
        'https://tccmd.site',
        'https://www.tccmd.site',
        'https://ghibli.tccmd.site',
      ],
      credentials: true,
    },
  });


  httpServer.listen(process.env.PORT || 4000, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
            server started on => http://localhost:4000
            graphql playground => http://localhost:4000/graphql
            `);
    } else {
      console.log(`
            Production server Started...
            `);
    }
  });
  

  await createDB();
}

main().catch((err) => console.error(err));
