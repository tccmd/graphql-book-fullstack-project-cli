import "reflect-metadata";
import express from "express";
import http from "http";
import { createDB } from "./db/db-client";
import dotenv from "dotenv";
import createApolloServer from "./apollo/createApolloServer";

// .env 파일에서 작성한 모든 환경변수는 process.env에 주입되었다.
dotenv.config();

async function main() {
  const app = express();

  const apolloServer = await createApolloServer();
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const httpServer = http.createServer(app);

  app.get("/", (req, res) => {
    res.status(200).send(); // for health check
    console.log("success");
  });

  httpServer.listen(process.env.PORT || 4000, () => {
    if (process.env.NODE_ENV !== "production") {
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
