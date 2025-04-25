import _ from "lodash";
import prisma from "../../utils/prisma";
import { CreateSessionInput } from "./session.schema";

export async function createSession(
  input: CreateSessionInput & { lecturerId: string; expiresAt: Date }
) {
  const { expiresAt, geolocationData, ...rest } = input;
  return await prisma.lectureSessions.create({
    data: _.merge({}, rest, {
      expiresAt: new Date(expiresAt),
      geolocationData: JSON.stringify(geolocationData),
    }),
  });
}
export async function findSessionsByCourseAndDate({
  courseId,
  start,
  end,
}: {
  courseId: string;
  start: Date;
  end: Date;
}) {
  return await prisma.lectureSessions.findFirst({
    where: {
      courseId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });
}

export async function findCourseById(id: string) {
  return await prisma.course.findUnique({
    where: {
      id,
    },
  });
}
