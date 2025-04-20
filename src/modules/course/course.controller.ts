import { FastifyReply, FastifyRequest } from "fastify";
import { CreateCourseInput, UpdateCourseDetails } from "./course.schema";
import {
  addLecturerToCourse,
  createCourse,
  deleteCourse,
  deleteLecturerFromCourse,
  findCourseByCourseCode,
  findCourseById,
  updateCourseDetails,
} from "./course.service";
import _ from "lodash";

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
        lecturerIds: course?.lecturers.map((lect) => lect.id),
      }),
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Failed to create course", error });
  }
}

// Update course details
export async function updateCourseDetailsHandler(
  req: FastifyRequest<{
    Body: UpdateCourseDetails;
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    console.log("passed");
    const { id } = req.params;
    const body = req.body;

    const course = await findCourseById(id);
    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const exist = await findCourseByCourseCode(body.courseCode);
    if (exist)
      return reply.code(409).send({
        success: false,
        message: "A course with this course code already exist",
      });

    const updated = await updateCourseDetails(id, body);

    return reply.send({ success: true, data: updated });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Update failed", error });
  }
}

// ADD LECTURER TO COURSE
export async function addLecturerToCourseHandler(
  req: FastifyRequest<{
    Body: { lecturerIds: string[] };
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const { lecturerIds } = req.body;

    const course = await findCourseById(id);
    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const { lecturers, ...updated } = await addLecturerToCourse(
      id,
      lecturerIds
    );

    return reply.send({
      success: true,
      data: _.merge({}, updated, {
        lecturerIds: lecturers.map((lect) => lect.id),
      }),
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Fail to add lecturer", error });
  }
}

// Remove a lecturer from a course
export async function deleteLecturerFromCourseHandler(
  req: FastifyRequest<{
    Body: { lecturerId: string };
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const { lecturerId } = req.body;

    const course = await findCourseById(id);
    if (_.isEmpty(course))
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const updated = deleteLecturerFromCourse(id, lecturerId);

    return reply.send({ success: true, data: updated });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Failed to remove lecturer", error });
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
      .send({ success: false, message: "Failed to delete course", error });
  }
}
