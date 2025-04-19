import { FastifyInstance } from "fastify";
import {
  createUser,
  createUserResponse,
  loginStudent,
  loginResponse,
  loginLecturer,
  changePassword,
  otherResponse,
} from "./user.schema";
import {
  changePasswordHandler,
  deleteUserHandler,
  forgotPasswordHandler,
  loginHandler,
  loginStudentHandler,
  regAdminHandler,
  regLecturerHandler,
  regStudentHandler,
  verifyResetCodeHandler,
} from "./user.controller";

interface RouteConfig {
  method: "post" | "get" | "put" | "delete";
  url: string;
  handler: any;
  schema: any;
  preHandler?: any;
}

export default async function userRoutes(server: FastifyInstance) {
  const studentRoutes: RouteConfig[] = [
    {
      method: "post",
      url: "/student",
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
      url: "/student/login",
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
      url: "/lecturer",
      handler: regLecturerHandler,
      schema: {
        body: createUser,
        response: {
          201: createUserResponse,
        },
      },
      preHandler: [server.authenticate, server.authorize(["ADMIN"])],
    },

    {
      method: "post",
      url: "/lecturer/login",
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
        body: createUser,
        response: {
          201: createUserResponse,
        },
      },
      preHandler: [server.authenticate, server.authorize(["ADMIN"])],
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
      preHandler: [
        server.authenticate,
        server.authorize(["ADMIN", "LECTURER"]),
      ],
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
      handler: forgotPasswordHandler,
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
      url: "/users/:id",
      handler: deleteUserHandler,
      schema: {
        response: {
          201: otherResponse,
        },
      },
      preHandler: [server.authenticate, server.authorize(["ADMIN"])],
    },
  ];

  const allUserRoutes: RouteConfig[] = [
    ...studentRoutes,
    ...lecturerRoutes,
    ...adminRoutes,
    ...changePasswordRoutes,
    ...deleteUserRoutes,
  ];

  allUserRoutes.forEach((route) => {
    server.route({
      method: route.method,
      url: route.url,
      handler: route.handler,
      schema: route.schema,
      preHandler: route?.preHandler,
    });
  });
}
