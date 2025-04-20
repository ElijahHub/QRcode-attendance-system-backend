import { FastifyInstance } from "fastify";
import { RouteConfig } from "../../types";
import {
  addLecturerToCourseHandler,
  createCourseHandler,
  deleteCourseHandler,
  deleteLecturerFromCourseHandler,
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
      body: createCourse,
      response: {
        201: createCourseResponse,
      },
    },
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
  },

  {
    method: "patch",
    url: "/update/:id/addLecturer",
    handler: addLecturerToCourseHandler,
    schema: {
      response: {
        201: updateCourseDetails,
      },
    },
  },

  {
    method: "patch",
    url: "/:id/removeLecturer",
    handler: deleteLecturerFromCourseHandler,
    schema: {
      response: {
        201: updateCourseDetails,
      },
    },
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
  },
];

export default async function coursesRoutes(server: FastifyInstance) {
  courseRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler: [server.authenticate, server.authorize(["ADMIN"])],
    });
  });
}
