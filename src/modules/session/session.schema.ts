import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createSessionSchema = z.object({
  courseId: z.string(),
  expiresAt: z.date(),
  geolocationData: z.string(),
});
