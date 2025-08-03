import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const scanDataSchema = z.object({
  qrData: z.string(),
  geolocationData: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  deviceId: z.string().uuid("Invalid device ID format"),
});

const createAttendanceSchema = z.object({
  sessionId: z.string().uuid("Invalid id format"),
  studentId: z.string().uuid("Invalid id format"),
  deviceId: z.string().uuid("Invalid device ID format"),
});

//Zod Schema to Json
export const scanData = zodToJsonSchema(scanDataSchema, "ScanDataSchema");
export const createAttendance = zodToJsonSchema(
  createAttendanceSchema,
  "CreateAttendance"
);

export const GetSessionsByCourseAndDateSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type GetSessionsByCourseAndDateInput = z.infer<
  typeof GetSessionsByCourseAndDateSchema
>;

//Type Inference
export type ScanData = z.infer<typeof scanDataSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
