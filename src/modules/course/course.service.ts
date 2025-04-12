import prisma from "../../utils/prisma";
import { CreateCourseInput } from "./course.schema";

export async function createCourse(input: CreateCourseInput) {
  return await prisma.course.create({
    data: {
      ...input,
      lecturers: {
        connect: input.lecturerIds.map((id) => ({ id })),
      },
    },
    include: {
      lecturers: true,
    },
  });
}

export async function addLecturerToCourse(
  lecturerIds: string[],
  courseId: string
) {
  return await prisma.course.update({
    where: { id: courseId },
    data: {
      lecturers: {
        connect: lecturerIds.map((id) => ({ id })),
      },
    },
    include: {
      lecturers: true,
    },
  });
}

export async function deleteLecturerFromCourse(
  lecturerId: string,
  courseId: string
) {
  return await prisma.course.update({
    where: { id: courseId },
    data: {
      lecturers: {
        disconnect: { id: lecturerId },
      },
    },
    include: {
      lecturers: true,
    },
  });
}

export async function deleteCourse(courseId: string) {
  return await prisma.course.delete({
    where: { id: courseId },
  });
}
