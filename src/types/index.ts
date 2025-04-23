import { FastifyReply } from "fastify";

export interface RouteConfig {
  method: "post" | "get" | "patch" | "delete";
  url: string;
  handler: any;
  schema: any;
  preHandler?: any;
}

export interface VerifyPassInput {
  candPassword: string;
  hash: string;
}

export interface LoginType {
  identifier: string;
  password: string;
  type: "matNumber" | "email";
  reply: FastifyReply;
}
