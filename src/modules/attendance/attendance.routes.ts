import { FastifyInstance } from "fastify";
import { RouteConfig } from "../../types";
import {
  getAllStudentAttendanceHandler,
  getAttendanceForAStudentHandler,
  getStudentAttendanceForSessionHandler,
  scanQrCodeHandler,
} from "./attendance.controller";
import {
  GetSessionsByCourseAndDateSchema,
  scanData,
} from "./attendance.schema";

const allRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/",
    handler: scanQrCodeHandler,
    schema: {
      body: scanData,
    },
  },

  {
    method: "get",
    url: "/student/:courseCode",
    handler: getAttendanceForAStudentHandler,
    schema: {},
  },

  {
    method: "get",
    url: "/:courseCode/all",
    handler: getAllStudentAttendanceHandler,
    schema: {},
    preHandler: "lecturer",
  },

  {
    method: "get",
    url: "/session",
    handler: getStudentAttendanceForSessionHandler,
    schema: {
      queryString: GetSessionsByCourseAndDateSchema,
    },
    preHandler: "lecturer",
  },
];

export default async function attendanceRoutes(server: FastifyInstance) {
  allRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler:
        route.preHandler === "lecturer"
          ? [server.authenticate, server.authorize(["LECTURER"])]
          : [server.authenticate, server.authorize(["STUDENT"])],
    });
  });
}
