import { FastifyReply, FastifyRequest } from "fastify";
import {
  ChangePasswordInput,
  CreateUserInput,
  LoginInputLecturer,
  LoginInputStudent,
} from "./user.schema";
import {
  changePassword,
  createUser,
  deleteUser,
  findUserById,
  findUserByMatNumber,
  findUserEmail,
} from "./user.service";
import { verifyPassword } from "../../utils/auth";
import { COOKIE_DOMAIN } from "../../config";

interface LoginType {
  identifier: string;
  password: string;
  type: "matNumber" | "email";
  reply: FastifyReply;
}

//* USER LOGIN HELPER FUNCTION
async function loginUser({ identifier, password, type, reply }: LoginType) {
  //? CHECKING USER EXISTENCE
  const user =
    type === "matNumber"
      ? await findUserByMatNumber(identifier)
      : await findUserEmail(identifier);

  if (!user) return null;

  //? CHECK FOR PASSWORD VALIDITY
  const correctPassword = await verifyPassword({
    candPassword: password,
    hash: user.password,
  });

  if (!correctPassword) return null;

  //? CHANGE DEFAULT PASSWORD
  if (user.mustChangePassword) {
    return reply.code(403).send({
      success: false,
      message: "You must change your password before continuing.",
      forceChange: true,
      userId: user.id,
    });
  }

  //? ACCESS TOKEN REGISTRATION
  const accessToken = await reply.jwtSign({
    _id: user.id,
    email: user.email,
    matNumber: user.matNumber,
    role: user.role,
  });

  //? SETTING COOKIE
  reply.setCookie("accessToken", accessToken, {
    domain: COOKIE_DOMAIN,
    path: "/",
    secure: false,
    httpOnly: true,
    sameSite: false,
  });

  return accessToken;
}

//* STUDENT REGISTRATION HANDLER
export async function regStudentHandler(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  try {
    const body = req.body;

    if (body.matNumber) {
      const existingUser = await findUserByMatNumber(body.matNumber);
      if (existingUser) {
        return reply.code(409).send({
          message: "A user with this matric number already exists.",
        });
      }
    }

    const user = await createUser({ ...body, mustChangePassword: false });
    return reply.code(201).send(user);
  } catch (error) {
    console.error(error);
    return reply.code(500).send(error);
  }
}

//* STUDENT LOGIN HANDLER
export async function loginStudentHandler(
  req: FastifyRequest<{
    Body: LoginInputStudent;
  }>,
  reply: FastifyReply
) {
  try {
    const { matNumber, password } = req.body;

    const accessToken = await loginUser({
      identifier: matNumber,
      password,
      type: "matNumber",
      reply,
    });

    if (!accessToken)
      return reply.code(401).send({ message: "Invalid matNumber or password" });

    return reply.code(200).send({
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return reply
      .code(500)
      .send({ message: "Something went wrong, please try again." });
  }
}

//* LECTURER REGISTRATION HANDLER
export async function regLecturerHandler(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  try {
    const body = req.body;
    const existingUser = await findUserEmail(body.email);

    if (existingUser) {
      return reply.code(409).send({
        message: "A user with this email number already exists.",
      });
    }

    const user = await createUser({
      ...body,
      password: "000000",
      confirmPassword: "000000",
      role: "LECTURER",
    });
    return reply.code(201).send(user);
  } catch (error) {
    console.error(error);
    return reply.code(500).send(error);
  }
}

//* ADMIN REGISTRATION HANDLER
export async function regAdminHandler(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  try {
    const body = req.body;
    const existingUser = await findUserEmail(body.email);

    if (existingUser) {
      return reply.code(409).send({
        message: "A user with this email number already exists.",
      });
    }

    const user = await createUser({
      ...body,
      password: "000000",
      confirmPassword: "000000",
      role: "ADMIN",
    });

    return reply.code(201).send(user);
  } catch (error) {
    console.error(error);
    return reply.code(500).send(error);
  }
}

//* LECTURER / ADMIN LOGIN HANDLER
export async function loginHandler(
  req: FastifyRequest<{
    Body: LoginInputLecturer;
  }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = req.body;

    const accessToken = await loginUser({
      identifier: email,
      password,
      type: "email",
      reply,
    });

    if (!accessToken)
      return reply.code(401).send({ message: "Invalid email or password" });

    return reply.code(200).send({
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return reply
      .code(500)
      .send({ message: "Something went wrong, please try again." });
  }
}

//* Change Password Routes for Admin & Lecturer
export async function changePasswordHandler(
  req: FastifyRequest<{
    Body: ChangePasswordInput;
  }>,
  reply: FastifyReply
) {
  try {
    const body = req.body;

    await changePassword(body);

    return reply.send({ success: true, message: "Password updated." });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Failed to update password" });
  }
}

//* Delete User Handler
export async function deleteUserHandler(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;

    const user = await findUserById(id);

    if (!user)
      return reply
        .code(404)
        .send({ success: false, message: "User not found." });

    if (user.role === "STUDENT")
      return reply.code(403).send({
        success: false,
        message: "Students cannot be deleted.",
      });

    await deleteUser(id);

    return reply.send({
      success: true,
      message: `User with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      success: false,
      message: "Failed to delete user. Please try again later.",
    });
  }
}
