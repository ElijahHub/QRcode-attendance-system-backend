import _ from "lodash";
import prisma from "../../utils/prisma";
import { CreateCourseInput, UpdateCourseDetails } from "./course.schema";

export async function createCourse(input: CreateCourseInput) {
  const { courseCode, lecturersId, ...rest } = input;

  return await prisma.course.create({
    data: {
      courseCode: _.toUpper(courseCode),
      ...rest,
      lecturers: {
        connect: lecturersId.map((id) => ({ id })),
      },
    },
    include: {
      lecturers: true,
    },
  });
}

export async function updateCourseDetails(
  courseId: string,
  input: UpdateCourseDetails & { lecturerIds: string[] }
) {
  const { courseCode, lecturerIds, ...rest } = input;
  return await prisma.course.update({
    where: { id: courseId },
    data: {
      courseCode: _.toUpper(courseCode),
      lecturers: {
        connect: lecturerIds.map((id) => ({ id })),
      },
      ...rest,
    },
    select: {
      courseCode: true,
      courseName: true,
      description: true,
      lecturers: {
        select: {
          id: true,
        },
      },
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
    where: { courseCode: _.toUpper(courseCode) },
    select: {
      id: true,
      courseCode: true,
      courseName: true,
      description: true,
      lecturers: {
        select: {
          id: true,
        },
      },
    },
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
    select: {
      courseCode: true,
      courseName: true,
      description: true,
      lecturers: {
        select: {
          id: true,
        },
      },
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
    select: {
      courseCode: true,
      courseName: true,
      description: true,
      lecturers: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function deleteCourse(courseId: string) {
  return await prisma.course.delete({
    where: { id: courseId },
  });
}

export async function getAllCourse() {
  return await prisma.course.findMany({
    select: {
      id: true,
      courseCode: true,
      courseName: true,
      description: true,
      lecturers: {
        select: {
          id: true,
        },
      },
    },
  });
}
