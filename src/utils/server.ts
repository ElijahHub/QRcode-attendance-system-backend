import fs from "fs";
import path from "path";

import fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { CORS_ORIGIN, privateKeyPath, publicKeyPath } from "../config";

import userRoutes from "../modules/user/user.routes";
import coursesRoutes from "../modules/course/course.routes";
import sessionRoutes from "../modules/session/session.routes";
import attendanceRoutes from "../modules/attendance/attendance.routes";

export default function server() {
  const app = fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  //* CORS REGISTRATION
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  //* JWT SETUP USING RSA256
  app.register(jwt, {
    secret: {
      private: fs.readFileSync(
        `${path.join(process.cwd(), privateKeyPath)}`,
        "utf8"
      ),
      public: fs.readFileSync(
        `${path.join(process.cwd(), publicKeyPath)}`,
        "utf8"
      ),
    },
    sign: { algorithm: "RS256" },
    cookie: {
      cookieName: "accessToken",
      signed: false,
    },
  });

  //* COOKIE REG
  app.register(cookie, {
    parseOptions: {},
  });

  //* AUTHENTICATION MIDDLEWARE
  app.decorate(
    "authenticate",
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await req.jwtVerify();
        req.user = user;
      } catch (error) {
        reply.code(401).send({ message: "Unauthorized", error });
      }
    }
  );

  //* ROLE BASED AUTHENTICATION MIDDLEWARE
  app.decorate(
    "authorize",
    function (roles: Array<"ADMIN" | "STUDENT" | "LECTURER">) {
      return async function (req: FastifyRequest, reply: FastifyReply) {
        try {
          const user: any = await req.jwtVerify();

          if (!roles.includes(user.role))
            return reply
              .code(403)
              .send({ message: "Forbidden: Access denied" });

          req.user = user;
        } catch (error) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
      };
    }
  );

  //? SERVER HEALTHCHECK
  app.get("/healthcheck", async function () {
    return { status: "OK" };
  });

  app.register(userRoutes, { prefix: "api/v1" });
  app.register(coursesRoutes, { prefix: "api/v1/courses" });
  app.register(sessionRoutes, { prefix: "api/v1/session" });
  app.register(attendanceRoutes, { prefix: "api/v1/attendance" });

  return app;
}
