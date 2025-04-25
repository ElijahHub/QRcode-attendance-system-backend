import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createSessionSchema = z.object({
  courseId: z.string().uuid("Invalid id format"),
  geolocationData: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const createSessionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    qrData: z.string(),
  }),
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
