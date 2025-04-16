import { FastifyReply, FastifyRequest } from "fastify";
import { CreateCourseInput, UpdateCourseDetails } from "./course.schema";
import {
  addLecturerToCourse,
  createCourse,
  deleteCourse,
  deleteLecturerFromCourse,
  findCourseById,
  updateCourseDetails,
} from "./course.service";

export async function createCourseHandler(
  req: FastifyRequest<{
    Body: CreateCourseInput;
  }>,
  reply: FastifyReply
) {
  try {
    const course = await createCourse(req.body);

    //TODO: check if course already exist using unique corse code

    return reply.code(201).send({ success: true, data: course });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Failed to create course" });
  }
}

//TODO: update course details
export async function updateCourseDetailsHandler(
  req: FastifyRequest<{
    Body: UpdateCourseDetails;
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const body = req.body;

    const course = await findCourseById(id);

    if (!course)
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const updated = await updateCourseDetails(id, body);

    return reply.send({ success: true, data: updated });
  } catch (error) {
    return reply.code(500).send({ success: false, message: "Update failed" });
  }
}

//TODO: ADD LECTURER TO COURSE
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

    if (!course)
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const updated = await addLecturerToCourse(id, lecturerIds);

    return reply.send({ success: true, data: updated });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Fail to add lecturer" });
  }
}

//TODO: remove a lecturer from a course
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

    if (!course)
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    const updated = deleteLecturerFromCourse(id, lecturerId);

    return reply.send({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return reply
      .code(500)
      .send({ success: false, message: "Failed to remove lecturer" });
  }
}

//TODO: delete a course
export async function deleteCourseHandler(
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const course = findCourseById(id);
    if (!course)
      return reply
        .code(404)
        .send({ success: false, message: "Course not found." });

    await deleteCourse(id);

    return reply.send({
      success: true,
      message: `Course with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    console.error(error);
    return reply
      .code(500)
      .send({ success: false, message: "Failed to delete course" });
  }
}
