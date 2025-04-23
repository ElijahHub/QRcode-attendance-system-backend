import _ from "lodash";
import { startOfDay, endOfDay } from "date-fns";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateSessionInput } from "./session.schema";
import {
  createSession,
  findCourseById,
  findSessionsByCourseAndDate,
} from "./session.service";
import { encrypt } from "../../utils/auth";

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

    const course = await findCourseById(body.courseId);

    if (_.isEmpty(course))
      return reply.code(404).send({
        success: false,
        message: "Invalid Course Id or Course Not Found",
      });

    // Check if a session already exists today
    const existingSession = await findSessionsByCourseAndDate({
      courseId: body.courseId,
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    });

    if (existingSession) {
      return reply.code(409).send({
        success: false,
        message: "A session for this course already exists today.",
      });
    }

    const { id } = await createSession(
      _.merge({}, body, { lecturerId: user._id })
    );

    const qrPayload = {
      id,
    };

    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString("base64");

    return reply
      .code(201)
      .send({ success: true, data: { qrData: encrypt(qrData) } });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}
