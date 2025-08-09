import { FastifyInstance } from "fastify";
import { RouteConfig } from "../../types";
import {
  createCourseHandler,
  deleteCourseHandler,
  getAllCourseHandler,
  getSpecificCourse,
  updateCourseDetailsHandler,
} from "./course.controller";
import {
  createCourseResponse,
  updateCourseDetails,
  createCourse,
  otherResponse,
} from "./course.schema";

const courseRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/",
    handler: createCourseHandler,
    schema: {
      response: {
        201: createCourseResponse,
      },
    },
    preHandler: true,
  },

  {
    method: "patch",
    url: "/update/:id",
    handler: updateCourseDetailsHandler,
    schema: {
      body: updateCourseDetails,
      response: {
        201: updateCourseDetails,
      },
    },
    preHandler: true,
  },

  {
    method: "delete",
    url: "/:id",
    handler: deleteCourseHandler,
    schema: {
      response: {
        201: otherResponse,
      },
    },
    preHandler: true,
  },

  {
    method: "get",
    url: "/",
    handler: getAllCourseHandler,
    schema: {},
    preHandler: false,
  },

  {
    method: "get",
    url: "/:courseCode",
    handler: getSpecificCourse,
    schema: {},
    preHandler: false,
  },
];

export default async function coursesRoutes(server: FastifyInstance) {
  courseRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler: route.preHandler
        ? [server.authenticate, server.authorize(["ADMIN"])]
        : [],
    });
  });
}
