import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const scanDataSchema = z.object({
  qrData: z.string(),
  geolocationData: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const qrDataSchema = z.object({
  id: z.string(),
  expiresAt: z.date(),
  geolocationData: z.string(),
});

const createAttendanceSchema = z.object({
  sessionId: z.string(),
  studentId: z.string(),
});

//Zod Schema to Json
export const scanData = zodToJsonSchema(scanDataSchema, "ScanDataSchema");
export const createAttendance = zodToJsonSchema(
  createAttendanceSchema,
  "CreateAttendance"
);

//Type Inference
export type ScanData = z.infer<typeof scanDataSchema>;
export type QrData = z.infer<typeof qrDataSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
