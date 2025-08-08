import _ from "lodash";
import prisma from "../../utils/prisma";
import { CreateCourseInput, UpdateCourseDetails } from "./course.schema";

export async function createCourse(input: CreateCourseInput) {
  const { courseCode, lecturerIds, ...rest } = input;

  return await prisma.$transaction(async (tx) => {
    // Duplicate check
    const existing = await tx.course.findUnique({
      where: { courseCode: _.toUpper(courseCode) },
    });
    if (existing) {
      throw new Error("DUPLICATE_COURSE");
    }

    // Optional: verify lecturers exist
    const lecturersExist = await tx.user.findMany({
      where: { id: { in: lecturerIds } },
      select: { id: true },
    });

    if (lecturersExist.length !== lecturerIds.length) {
      throw new Error("INVALID_LECTURERS");
    }

    // Create course
    return tx.course.create({
      data: {
        courseCode: _.toUpper(courseCode),
        ...rest,
        lecturers: {
          connect: lecturerIds.map((id) => ({ id })),
        },
      },
      include: { lecturers: true },
    });
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
      courseCode: _.toUpper(courseCode),
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
