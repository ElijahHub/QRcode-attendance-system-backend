import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createSessionSchema = z.object({
  courseId: z.string(),
  expiresAt: z.date(),
  geolocationData: z.string(),
});

const createSessionResponseSchema = z.object({
  courseId: z.string(),
  expiresAt: z.date(),
  geolocationData: z.string(),
  lecturerId: z.string(),
});

// Zod schemas to Json Schema
export const createSession = zodToJsonSchema(
  createSessionSchema,
  "CreateSessionSchema"
);
export const createSessionResponse = zodToJsonSchema(
  createSessionResponseSchema,
  "CreateSessionResponse"
);

// Type Inference
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
