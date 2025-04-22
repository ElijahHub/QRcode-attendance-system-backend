import { FastifyInstance } from "fastify";
import { RouteConfig } from "../../types";
import { scanQrCodeHandler } from "./attendance.controller";
import { scanData } from "./attendance.schema";

const seRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/",
    handler: scanQrCodeHandler,
    schema: {
      body: scanData,
    },
  },
];

export default async function attendanceRoutes(server: FastifyInstance) {
  seRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler: [server.authenticate, server.authorize(["STUDENT"])],
    });
  });
}
