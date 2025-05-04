import _ from "lodash";
import prisma from "../../utils/prisma";
import { encrypt, generateHmac, genHash } from "../../utils/auth";
import { structureName } from "../../utils";
import {
  CreateUserInput,
  ChangePasswordInput,
  PasswordResetInput,
  CreateUserWithOutPass,
} from "./user.schema";

const validatePasswordMatch = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) throw new Error("Passwords do not match");
};

export async function createUser(input: CreateUserInput) {
  const { password, confirmPassword, name, matNumber, email, ...rest } = input;

  validatePasswordMatch(password, confirmPassword);

  const hashedPassword = await genHash(password);

  const upperMatNumber = _.toUpper(matNumber);
  const lowerEmail = _.toLower(email);

  return prisma.user.create({
    data: {
      name: encrypt(structureName(name)),
      matNumber: matNumber ? encrypt(upperMatNumber) : null,
      matNumberMac: matNumber ? generateHmac(upperMatNumber) : null,
      email: encrypt(lowerEmail),
      emailMac: generateHmac(lowerEmail),
      password: hashedPassword,
      ...rest,
    },
  });
}

export async function updateUserDetails(
  id: string,
  input: CreateUserWithOutPass
) {
  const { name, email, matNumber } = input;

  const upperMatNumber = _.toUpper(matNumber);
  const lowerEmail = _.toLower(email);

  return prisma.user.update({
    where: { id },
    data: {
      name: encrypt(structureName(name)),
      matNumber: matNumber ? encrypt(upperMatNumber) : null,
      matNumberMac: matNumber ? generateHmac(upperMatNumber) : null,
      email: encrypt(lowerEmail),
      emailMac: generateHmac(lowerEmail),
    },
    select: {
      name: true,
      matNumber: true,
      email: true,
    },
  });
}

export async function changePassword(input: ChangePasswordInput) {
  const { email, newPassword, confirmPassword } = input;

  validatePasswordMatch(newPassword, confirmPassword);

  const hashedPassword = await genHash(newPassword);
  const lowerEmail = _.toLower(email);

  return prisma.user.update({
    where: { emailMac: generateHmac(lowerEmail) },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });
}

export async function findUserByMatNumber(matNumber: string) {
  const upperMatNumber = _.toUpper(matNumber);
  return await prisma.user.findUnique({
    where: {
      matNumberMac: generateHmac(upperMatNumber),
    },
  });
}

export async function findUserEmail(email: string) {
  const lowerEmail = _.toLower(email);
  return await prisma.user.findUnique({
    where: {
      emailMac: generateHmac(lowerEmail),
    },
  });
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      matNumber: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export async function findStudent() {
  return await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      matNumber: true,
      name: true,
      email: true,
    },
  });
}

export async function findLecturer() {
  return await prisma.user.findMany({
    where: { role: "LECTURER" },
    select: {
      id: true,
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
  const { email, code, ...rest } = input;
  const lowerEmail = _.toLower(email);
  const hashCode = await genHash(code);

  return await prisma.passwordReset.create({
    data: {
      emailMac: generateHmac(lowerEmail),
      email: encrypt(lowerEmail),
      code: hashCode,
      ...rest,
    },
  });
}

export async function verifyResetCode({ email }: { email: string }) {
  return await prisma.passwordReset.findFirst({
    where: {
      emailMac: generateHmac(_.toLower(email)),
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function changeResetCodeStatus(id: string) {
  return await prisma.passwordReset.update({
    where: { id },
    data: { used: true },
  });
}
