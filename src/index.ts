import { FastifyInstance } from "fastify";
import server from "./utils/server";
import { connectToDb, disconnectFromDb } from "./utils/prisma";

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
    authorize: (
      roles: Array<"ADMIN" | "STUDENT" | "LECTURER">
    ) => any
  }
}

function gracefulShutDown(signal: string, app: FastifyInstance) {
  process.on(signal, async () => {
    app.log.info(`Good Bye, Got Signal ${signal}`);

    //Closing Server
    app.close();

    //Disconnect database
    await disconnectFromDb();

    app.log.info("Work Done");

    process.exit(0);
  });
}

async function main() {
  const app = server();

  try {
    app.log.info("Starting server");
    const url = await app.listen({ port: 8800, host: "0.0.0.0" });
    app.log.info(` {o_o} Server started successful at ${url}`);

    //connect to database
    await connectToDb();
  } catch (error) {
    app.log.info(error);
    process.exit(1);
  }

  const signals = ["SIGTERM", "SIGINT"];

  for (let i = 0; i < signals.length; i++) gracefulShutDown(signals[i], app);
}

main();
