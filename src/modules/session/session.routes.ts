import { FastifyInstance } from "fastify";
import { RouteConfig } from "../../types";
import { createSessionHandler } from "./session.controller";
import { createSession, createSessionResponse } from "./session.schema";

const seRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/create",
    handler: createSessionHandler,
    schema: {
      body: createSession,
      response: {
        201: createSessionResponse,
      },
    },
    preHandler: true,
  },
];

export default async function sessionRoutes(server: FastifyInstance) {
  seRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler: route.preHandler
        ? [server.authenticate, server.authorize(["LECTURER"])]
        : [server.authenticate, server.authorize(["STUDENT"])],
    });
  });
}
