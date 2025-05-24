import _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { ScanData } from "./attendance.schema";
import {
  createAttendanceRecord,
  findAttendanceRecord,
  findSessionById,
  getAllStudentAttendance,
  getAttendanceForAStudent,
  getStudentAttendanceForSession,
} from "./attendance.service";
import { validateProximity } from "../../utils";
import { decrypt } from "../../utils/auth";
import { findCourseByCourseCode } from "../course/course.service";

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

    const decryptData = decrypt(body.qrData);

    const { id: sessionId }: { id: string } = JSON.parse(
      Buffer.from(decryptData, "base64").toString()
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
      return reply.code(401).send({
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

// GET ATTENDANCE RECORD FOR A PARTICULAR COURSE
export async function getAllStudentAttendanceHandler(
  req: FastifyRequest<{
    Params: { courseCode: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { courseCode } = req.params;
    const course = await findCourseByCourseCode(_.toUpper(courseCode));

    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course Not Found" });

    const attendance = await getAllStudentAttendance(course.id);

    return reply.code(200).send({
      success: true,
      data: attendance,
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}

//GET ATTENDANCE RECORD FOR A PARTICULAR COURSE FOR A SESSION
export async function getStudentAttendanceForSessionHandler(
  req: FastifyRequest<{
    Params: { sessionId: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { sessionId } = req.params;

    const attendance = await getStudentAttendanceForSession(sessionId);

    if (_.isEmpty(attendance))
      return reply
        .code(404)
        .send({ success: false, message: "Session Not Found" });

    return reply.code(200).send({ success: true, data: attendance });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}

//TODO: GET ATTENDANCE RECORD FOR A PARTICULAR STUDENT ON A PARTICULAR COURSE
export async function getAttendanceForAStudentHandler(
  req: FastifyRequest<{
    Params: { courseCode: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { _id } = req.user as { _id: string };
    const { courseCode } = req.params;

    const course = await findCourseByCourseCode(_.toUpper(courseCode));

    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course Not Found" });

    const attendance = await getAttendanceForAStudent({
      studentId: _id,
      courseId: course.id,
    });

    return reply.code(200).send({
      success: true,
      data: _.merge({}, attendance, { course: course.courseCode }),
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}
//needed
