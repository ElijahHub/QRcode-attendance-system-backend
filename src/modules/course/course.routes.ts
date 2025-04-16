import { FastifyInstance } from "fastify";
import { RouteConfig } from "../../types";
import {
  addLecturerToCourseHandler,
  createCourseHandler,
  deleteCourseHandler,
  deleteLecturerFromCourseHandler,
  updateCourseDetailsHandler,
} from "./course.controller";
import { createCourse } from "./course.service";
import { createCourseResponse, updateCourseDetails } from "./course.schema";

export default async function coursesRoutes(server: FastifyInstance) {
  //TODO: add prehandler to necessary routes and update schemas
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
      url: "/:id/addLecturer",
      handler: addLecturerToCourseHandler,
      schema: {},
    },

    {
      method: "patch",
      url: "/:id/removeLecturer",
      handler: deleteLecturerFromCourseHandler,
      schema: {},
    },

    {
      method: "delete",
      url: "/:id",
      handler: deleteCourseHandler,
      schema: {},
    },
  ];

  courseRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler: route?.preHandler,
    });
  });
}
