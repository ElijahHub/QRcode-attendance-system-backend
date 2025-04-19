import prisma from "../../utils/prisma";
import { genHash } from "../../utils/auth";
import { structureName } from "../../utils";
import {
  CreateUserInput,
  ChangePasswordInput,
  PasswordResetInput,
} from "./user.schema";

export async function createUser(input: CreateUserInput) {
  const { password, confirmPassword, matNumber, email, name, ...rest } = input;

  if (password !== confirmPassword) throw new Error("Passwords do not match");

  const hashedPassword = await genHash(password);

  const user = await prisma.user.create({
    data: {
      name: structureName(name),
      matNumber: matNumber?.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      ...rest,
    },
  });

  return user;
}

export async function changePassword(input: ChangePasswordInput) {
  const { email, newPassword, confirmPassword } = input;

  if (newPassword !== confirmPassword)
    throw new Error("Passwords do not match");

  const hashedPassword = await genHash(newPassword);

  return await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });
}

export async function findUserByMatNumber(matNumber: string) {
  return await prisma.user.findUnique({
    where: {
      matNumber: matNumber.toUpperCase(),
    },
  });
}

export async function findUserEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id: id },
  });
}

export async function findUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      matNumber: true,
      name: true,
      email: true,
    },
  });
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}

export async function createPasswordReset(input: PasswordResetInput) {
  return await prisma.passwordRest.create({
    data: {
      ...input,
    },
  });
}

export async function verifyResetCode({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  return await prisma.passwordRest.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function changeResetCodeStatus(id: string) {
  return await prisma.passwordRest.update({
    where: { id },
    data: { used: true },
  });
}
