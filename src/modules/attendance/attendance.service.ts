import _ from "lodash";
import prisma from "../../utils/prisma";
import { CreateAttendanceInput } from "./attendance.schema";
import { decrypt } from "../../utils/auth";

export async function createAttendanceRecord(input: CreateAttendanceInput) {
  return await prisma.attendanceRecords.create({
    data: {
      ...input,
    },
  });
}

export async function findAttendanceRecord(input: CreateAttendanceInput) {
  return await prisma.attendanceRecords.findFirst({
    where: {
      ...input,
    },
  });
}

export async function findSessionById(sessionId: string) {
  return await prisma.lectureSessions.findUnique({
    where: { id: sessionId },
  });
}

export async function getStudentAttendanceForSession(
  courseId: string,
  date: Date
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.lectureSessions.findMany({
    where: {
      courseId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { id: true },
  });

  const sessionIds = sessions.map((s: any) => s.id);
  if (sessionIds.length === 0) return [];

  const records = await prisma.attendanceRecords.findMany({
    where: {
      sessionId: { in: sessionIds },
    },
    include: {
      student: true,
    },
  });

  return records.map((record: any) => ({
    date: record.timestamp,
    matNumber: decrypt(record.student.matNumber as string),
    name: decrypt(record.student.name),
  }));
}

export async function getAllStudentAttendance(courseId: string) {
  const sessions = await prisma.lectureSessions.findMany({
    where: { courseId },
    include: { attendance: { include: { student: true } } },
  });

  const allAttendance = _.flatMap(sessions, (session) =>
    _.map(session.attendance, (record) => ({
      date: record.timestamp,
      matNumber: decrypt(record.student.matNumber as string),
      name: decrypt(record.student.name),
    }))
  );

  return allAttendance;
}

export async function getAttendanceForAStudent({
  studentId,
  courseId,
}: {
  studentId: string;
  courseId: string;
}) {
  const courseSessions = await prisma.lectureSessions.count({
    where: { courseId },
  });

  const attendedSessions = await prisma.attendanceRecords.count({
    where: {
      studentId,
      lecture: {
        courseId,
      },
    },
  });

  return {
    total: courseSessions,
    attended: attendedSessions,
    status: `${attendedSessions}/${courseSessions}`,
  };
}
