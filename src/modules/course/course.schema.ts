import { string, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const courseCore = {
  courseCode: z.string(),
  courseName: z.string(),
  lecturerIds: z.array(z.string()),
  description: z.string().max(500, "Cant be more than 500").optional(),
};

const createCourseSchema = z.object({
  ...courseCore,
});

const createCourseResponseSchema = z.object({
  id: z.string(),
  ...courseCore,
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const createCourse = zodToJsonSchema(createCourseSchema, "CreateCourse");

export const createCourseResponse = zodToJsonSchema(
  createCourseResponseSchema,
  "CreateCourseResponse"
);
