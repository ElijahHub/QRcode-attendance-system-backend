import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const courseCore = {
  courseCode: z.string(),
  courseName: z.string(),
  description: z.string().max(500, "Cant be more than 500").optional(),
};

const createCourseSchema = z.object({
  ...courseCore,
  lecturerIds: z.array(z.string()),
});

const createCourseResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    ...courseCore,
    lecturerIds: z.array(z.string()),
  }),
});

const updateCourseDetailsSchema = z.object({
  ...courseCore,
});

// Zod schema to Json Schema
export const createCourse = zodToJsonSchema(createCourseSchema, "CreateCourse");

export const createCourseResponse = zodToJsonSchema(
  createCourseResponseSchema,
  "CreateCourseResponse"
);
export const updateCourseDetails = zodToJsonSchema(
  updateCourseDetailsSchema,
  "UpdateCourseDetails"
);
export const otherResponse = zodToJsonSchema(
  z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  "otherResponse"
);

// Type Inference
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseDetails = z.infer<typeof updateCourseDetailsSchema>;
