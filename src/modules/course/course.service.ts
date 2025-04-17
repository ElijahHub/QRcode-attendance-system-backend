import prisma from "../../utils/prisma";
import { CreateCourseInput, UpdateCourseDetails } from "./course.schema";

export async function createCourse(input: CreateCourseInput) {
  const { courseCode, ...rest } = input;

  return await prisma.course.create({
    data: {
      courseCode: courseCode.toUpperCase(),
      ...rest,
      lecturers: {
        connect: input.lecturerIds.map((id) => ({ id })),
      },
    },
    include: {
      lecturers: true,
    },
  });
}

export async function updateCourseDetails(
  courseId: string,
  input: UpdateCourseDetails
) {
  const { courseCode, ...rest } = input;
  return await prisma.course.update({
    where: { id: courseId },
    data: {
      courseCode: courseCode.toUpperCase(),
      ...rest,
    },
  });
}

export async function findCourseById(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
  });
}

export async function findCourseByCourseCode(courseCode: string) {
  return await prisma.course.findUnique({
    where: { courseCode },
  });
}

export async function addLecturerToCourse(
  courseId: string,
  lecturerIds: string[]
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
  courseId: string,
  lecturerId: string
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
