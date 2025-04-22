import { FastifyReply, FastifyRequest } from "fastify";
import _ from "lodash";
import { QrData, ScanData } from "./attendance.schema";
import {
  createAttendanceRecord,
  findAttendanceRecord,
  findSessionById,
} from "./attendance.service";
import { validateProximity } from "../../utils";

export async function scanQrCodeHandler(
  req: FastifyRequest<{
    Body: ScanData;
  }>,
  reply: FastifyReply
) {
  try {
    const body = req.body;
    const { _id: studentId } = req.user as { _id: string };

    if (_.isEmpty(studentId))
      return reply.code(401).send({
        success: false,
        message: "Unauthorized. User not found in request.",
      });

    const { id: sessionId }: QrData = JSON.parse(
      Buffer.from(body.qrData, "base64").toString()
    );

    const session = await findSessionById(sessionId);

    if (_.isEmpty(session))
      return reply.code(404).send({
        success: false,
        message: "Session Not Found",
      });

    // GeoLocation Proximity Validation
    const location = validateProximity({
      studentLocation: body.geolocationData,
      sessionLocation: JSON.parse(session.geolocationData),
      radMeter: 1000,
    });

    if (!location)
      return reply.code(404).send({
        success: false,
        message: "Invalid Location",
      });

    const alreadyMarked = await findAttendanceRecord({
      sessionId,
      studentId,
    });

    if (alreadyMarked)
      return reply.code(409).send({
        success: false,
        message: "Attendance Already Marked",
      });

    if (new Date(Date.now()) > session.expiresAt)
      return reply.code(401).send({
        success: false,
        message: "Session Expired",
      });

    const record = await createAttendanceRecord({
      sessionId,
      studentId,
    });

    return reply.code(201).send({ success: true, data: { record } });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}
