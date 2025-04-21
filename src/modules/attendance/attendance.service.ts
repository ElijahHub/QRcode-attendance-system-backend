import prisma from "../../utils/prisma";
import { CreateAttendanceInput } from "./attendance.schema";

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
