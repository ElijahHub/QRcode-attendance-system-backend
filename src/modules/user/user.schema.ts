import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

//Common User field
const userCore = {
  matNumber: z.string().optional(),
  name: z.string().min(5, "Name must be at least 5 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["STUDENT", "LECTURER", "ADMIN"]).optional(),
  mustChangePassword: z.boolean().optional(),
};

// Create User Schema
const createUserSchema = z
  .object({
    ...userCore,
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Create User schema response
const createUserResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    ...userCore,
  }),
});

//Login Schema
const loginSchemaStudent = z.object({
  matNumber: z.string(),
  password: z.string(),
});

const loginSchemaLecturer = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

const loginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    accessToken: z.string(),
  }),
});

// Change password schema
const changePasswordSchema = z
  .object({
    email: z.string().email(),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Password reset schema
const passwordResetSchema = z.object({
  email: z.string().email(),
  code: z.string(),
  expiresAt: z.date(),
});

// Zod schemas to Json Schema
export const createUser = zodToJsonSchema(createUserSchema, "CreateUser");
export const createUserResponse = zodToJsonSchema(
  createUserResponseSchema,
  "CreateUserResponse"
);
export const loginStudent = zodToJsonSchema(loginSchemaStudent, "Login");
export const loginLecturer = zodToJsonSchema(loginSchemaLecturer, "Login");
export const loginResponse = zodToJsonSchema(
  loginResponseSchema,
  "LoginResponse"
);
export const changePassword = zodToJsonSchema(
  changePasswordSchema,
  "ChangePassword"
);
export const otherResponse = zodToJsonSchema(
  z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  "otherResponse"
);

// Type Inference
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInputStudent = z.infer<typeof loginSchemaStudent>;
export type LoginInputLecturer = z.infer<typeof loginSchemaLecturer>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
