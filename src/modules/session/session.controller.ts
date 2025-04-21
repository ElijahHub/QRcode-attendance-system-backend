import { FastifyReply, FastifyRequest } from "fastify";
import { CreateSessionInput } from "./session.schema";
import { createSession } from "./session.service";
import _ from "lodash";

export async function createSessionHandler(
  req: FastifyRequest<{
    Body: CreateSessionInput;
  }>,
  reply: FastifyReply
) {
  try {
    const user = req.user as {
      _id: string;
    };

    const body = req.body;

    const session = await createSession(
      _.merge({}, body, { lecturerId: user._id })
    );

    return reply.send({ success: true, data: session });
  } catch (error) {}
}
