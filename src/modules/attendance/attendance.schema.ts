import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const scanDataSchema = z.object({
  qrData: z.string(),
  geolocationData: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const createAttendanceSchema = z.object({
  sessionId: z.string().uuid("Invalid id format"),
  studentId: z.string().uuid("Invalid id format"),
});

//Zod Schema to Json
export const scanData = zodToJsonSchema(scanDataSchema, "ScanDataSchema");
export const createAttendance = zodToJsonSchema(
  createAttendanceSchema,
  "CreateAttendance"
);

//Type Inference
export type ScanData = z.infer<typeof scanDataSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
