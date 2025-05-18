import { FastifyInstance } from "fastify";
import {
  createUser,
  createUserResponse,
  loginStudent,
  loginResponse,
  loginLecturer,
  changePassword,
  otherResponse,
  createUserWithoutPass,
} from "./user.schema";
import {
  changePasswordHandler,
  deleteUserHandler,
  forgotPasswordHandler,
  getAllLecturerHandler,
  getAllStudentHandler,
  getSpecificUserHandler,
  loginHandler,
  loginStudentHandler,
  regAdminHandler,
  regLecturerHandler,
  regStudentHandler,
  resetPasswordHandler,
  updateUserDetailsHandler,
  verifyResetCodeHandler,
} from "./user.controller";

import type { RouteConfig } from "../../types";

const studentRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/students",
    handler: regStudentHandler,
    schema: {
      body: createUser,
      response: {
        201: createUserResponse,
      },
    },
  },

  {
    method: "post",
    url: "/students/login",
    handler: loginStudentHandler,
    schema: {
      body: loginStudent,
      response: {
        201: loginResponse,
      },
    },
  },
];

const lecturerRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/lecturers",
    handler: regLecturerHandler,
    schema: {
      body: createUserWithoutPass,
      response: {
        201: createUserResponse,
      },
    },
    preHandler: true,
  },

  {
    method: "post",
    url: "/lecturers/login",
    handler: loginHandler,
    schema: {
      body: loginLecturer,
      response: {
        201: loginResponse,
      },
    },
  },
];

const adminRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/admin",
    handler: regAdminHandler,
    schema: {
      body: createUserWithoutPass,
      response: {
        201: createUserResponse,
      },
    },
    preHandler: true,
  },

  {
    method: "post",
    url: "/admin/login",
    handler: loginHandler,
    schema: {
      body: loginLecturer,
      response: {
        201: loginResponse,
      },
    },
  },
];

const changePasswordRoutes: RouteConfig[] = [
  {
    method: "post",
    url: "/change-password",
    handler: changePasswordHandler,
    schema: {
      body: changePassword,
      response: {
        201: otherResponse,
      },
    },
  },

  {
    method: "post",
    url: "/forgot-password",
    handler: forgotPasswordHandler,
    schema: {
      response: {
        201: otherResponse,
      },
    },
  },

  {
    method: "post",
    url: "/verify-reset-code",
    handler: verifyResetCodeHandler,
    schema: {
      response: {
        201: otherResponse,
      },
    },
  },
  {
    method: "post",
    url: "/reset-password",
    handler: resetPasswordHandler,
    schema: {
      response: {
        201: otherResponse,
      },
    },
  },
];

const deleteUserRoutes: RouteConfig[] = [
  {
    method: "delete",
    url: "user/:id",
    handler: deleteUserHandler,
    schema: {
      response: {
        201: otherResponse,
      },
    },
    preHandler: true,
  },
];

const getUserRoutes: RouteConfig[] = [
  {
    method: "get",
    url: "/lecturers",
    handler: getAllLecturerHandler,
    schema: {},
    preHandler: true,
  },
  {
    method: "get",
    url: "/students",
    handler: getAllStudentHandler,
    schema: {},
    preHandler: true,
  },
  {
    method: "get",
    url: "/user/:id",
    handler: getSpecificUserHandler,
    schema: {},
  },
];

const updateUserRoutes: RouteConfig[] = [
  {
    method: "patch",
    url: "/user/update/:id",
    handler: updateUserDetailsHandler,
    schema: {},
    preHandler: true,
  },
];

const allUserRoutes: RouteConfig[] = [
  ...studentRoutes,
  ...lecturerRoutes,
  ...adminRoutes,
  ...changePasswordRoutes,
  ...deleteUserRoutes,
  ...getUserRoutes,
  ...updateUserRoutes,
];

export default async function userRoutes(server: FastifyInstance) {
  allUserRoutes.forEach((route) => {
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
