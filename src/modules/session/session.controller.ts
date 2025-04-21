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
    const user = req.user as { _id: string };
    const body = req.body;

    if (_.isEmpty(user._id))
      return reply.code(401).send({
        success: false,
        message: "Unauthorized. Lecturer not found in request.",
      });

    const { id, expiresAt, geolocationData } = await createSession(
      _.merge({}, body, { lecturerId: user._id })
    );

    const qrPayload = {
      id,
      expiresAt,
      geolocationData,
    };

    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString("base64");

    return reply.code(201).send({ success: true, data: { qrData } });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}
