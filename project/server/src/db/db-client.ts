// import User from "../entities/User";
// import { DataSource } from "typeorm";

// const AppDataSource = new DataSource({
//   type: "mysql",
//   host: process.env.DB_HOST || "localhost",
//   port: Number(process.env.DB_PORT) || 3306,
//   database: process.env.DB_DATABASE || "ghibli_graphql",
//   username: process.env.DB_USERNAME || "root",
//   password: process.env.DB_PASSWORD || "qwer1234",
//   logging: !(process.env.NODE_ENV === "production"),
//   synchronize: false,
//   entities: [User],
//   extra: {
//     connectTimeout: 30000, // 30초
//     acquireTimeout: 30000, // 30초
//   },
// });

// export const createDB = async () => {
//   await AppDataSource.initialize();
//   return AppDataSource;
// };

// export const createDB = async () => {
//   try {
//     console.log("DB_HOST:", process.env.DB_HOST);
//     console.log("DB_USERNAME:", process.env.DB_USERNAME);
//     console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
//     console.log("DB_DATABASE:", process.env.DB_DATABASE);
//     console.log("Initializing DB connection...");
//     await AppDataSource.initialize();
//     console.log("DB connection successful");
//     return AppDataSource;
//   } catch (error) {
//     console.error("DB connection failed", error);
//     throw error; // 오류를 던져서 문제의 원인을 추적할 수 있게 합니다.
//   }
// };

// import { Connection, createConnection } from "typeorm";
// import User from "../entities/User";

// export const createDB = async (): Promise<Connection> =>
//   createConnection({
//     type: "mysql",
//     host: process.env.DB_HOST || "localhost",
//     port: Number(process.env.DB_PORT) || 3306,
//     database: process.env.DB_DATABASE || "ghibli_graphql",
//     username: process.env.DB_USERNAME || "root",
//     password: process.env.DB_PASSWORD || "qwer1234",
//     logging: !(process.env.NODE_ENV === "production"),
//     synchronize: false, // entities에 명시된 데이터 모델들을 DB에 자동으로 동기화
//     entities: [User], // entities 폴더의 모든 데이터 모델이 위치해야 한다.
//   });

import { Connection, createConnection } from "typeorm";
import User from "../entities/User";

export const createDB = async (): Promise<Connection> => {
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_USERNAME:", process.env.DB_USERNAME);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
  console.log("DB_DATABASE:", process.env.DB_DATABASE);
  try {
    const connection = await createConnection({
      type: "mysql",
      // host: process.env.DB_HOST || "localhost",
      // port: Number(process.env.DB_PORT) || 3306,
      // database: process.env.DB_DATABASE || "ghibli_graphql",
      // username: process.env.DB_USERNAME || "root",
      // password: process.env.DB_PASSWORD || "qwer1234",
      // logging: !(process.env.NODE_ENV === "production"),
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      logging: !(process.env.NODE_ENV === "production"),
      synchronize: true, // entities에 명시된 데이터 모델들을 DB에 자동으로 동기화
      entities: [User], // entities 폴더의 모든 데이터 모델이 위치해야 한다.
      extra: {
        connectTimeout: 30000, // 요청 시간을 30초로 설정 (밀리초 단위)
      },
    });
    console.log("Database connection established successfully.");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; // 필요에 따라 에러를 다시 던져 상위 코드에서 처리할 수 있음
  }
};
