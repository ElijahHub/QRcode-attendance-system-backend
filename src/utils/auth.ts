import argon2 from "argon2";
import { FastifyReply, FastifyRequest } from "fastify";

interface VerifyPassInput {
  candPassword: string;
  hash: string;
}

export async function genHash(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

export function verifyPassword({ candPassword, hash }: VerifyPassInput) {
  return argon2.verify(hash, candPassword);
}

export function requireAdmin(roles: Array<"ADMIN" | "STUDENT" | "LECTURER">) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    try {
      const user: any = await req.jwtVerify();

      if (!roles.includes(user.role))
        return reply.code(403).send({ message: "Forbidden: Access denied" });

      req.user = user;
    } catch (error) {
      return reply.code(401).send({ message: "Unauthorized" });
    }
  };
}
