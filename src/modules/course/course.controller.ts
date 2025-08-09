import _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateCourseInput, UpdateCourseDetails } from "./course.schema";
import {
  addLecturerToCourse,
  createCourse,
  deleteCourse,
  deleteLecturerFromCourse,
  findCourseByCourseCode,
  findCourseById,
  getAllCourse,
  updateCourseDetails,
} from "./course.service";

// Create course handler
export async function createCourseHandler(
  req: FastifyRequest<{
    Body: CreateCourseInput;
  }>,
  reply: FastifyReply
) {
  try {
    const { courseCode } = req.body;

    const exist = await findCourseByCourseCode(courseCode);
    if (exist)
      return reply.code(409).send({
        success: false,
        message: "A course with this course code already exist",
      });

    const course = await createCourse(req.body);

    return reply.code(201).send({
      success: true,
      data: _.merge({}, course, {
        lecturersId: course?.lecturers.map((lect) => lect.id),
      }),
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Failed to create course" });
  }
}

// Update course details
export async function updateCourseDetailsHandler(
  req: FastifyRequest<{
    Body: UpdateCourseDetails & { lecturerIds: string[] };
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const body = req.body;

    const course = await findCourseById(id);

    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const exist = await findCourseByCourseCode(body.courseCode);

    if (body.courseCode !== course.courseCode && exist)
      return reply.code(409).send({
        success: false,
        message: "A course with this course code already exist",
      });

    const { lecturers, ...rest } = await updateCourseDetails(id, body);

    return reply.send({
      success: true,
      data: _.merge({}, rest, { lecturersId: lecturers.map((lec) => lec.id) }),
    });
  } catch (error) {
    return reply.code(500).send({ success: false, message: "Update failed" });
  }
}

// Delete a course
export async function deleteCourseHandler(
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;

    const course = await findCourseById(id);
    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    await deleteCourse(id);

    return reply.send({
      success: true,
      message: `Course with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Failed to delete course" });
  }
}

// Get all course
export async function getAllCourseHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const course = await getAllCourse();

    const courseData = _.map(course, (data) => ({
      id: data.id,
      courseCode: data.courseCode,
      courseName: data.courseName,
      description: data.description,
      lecturersId: _.map(data.lecturers, (lec) => lec.id),
    }));

    return reply.code(200).send({ success: true, data: courseData });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something Went Wrong" });
  }
}

// Get specific course
export async function getSpecificCourse(
  req: FastifyRequest<{
    Params: { courseCode: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { courseCode } = req.params;
    const course = await findCourseByCourseCode(courseCode);

    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const courseData = {
      id: course.id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description,
      lecturersId: _.map(course.lecturers, (lec) => lec.id),
    };

    return reply.code(200).send({ success: true, data: courseData });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something Went Wrong" });
  }
}
