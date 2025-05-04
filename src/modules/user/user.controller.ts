import _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  ChangePasswordInput,
  CreateUserInput,
  CreateUserWithOutPass,
  LoginInputLecturer,
  LoginInputStudent,
} from "./user.schema";
import {
  changePassword,
  changeResetCodeStatus,
  createPasswordReset,
  createUser,
  deleteUser,
  findLecturer,
  findStudent,
  findUserById,
  findUserByMatNumber,
  findUserEmail,
  updateUserDetails,
  verifyResetCode,
} from "./user.service";
import { decrypt, verifyPassword } from "../../utils/auth";
import { COOKIE_DOMAIN } from "../../config";
import { generateRandomCode, maskEmail, sendResetEmail } from "../../utils";
import { LoginType } from "../../types";

//* USER LOGIN HELPER FUNCTION
async function loginUser({ identifier, password, type, reply }: LoginType) {
  //? CHECKING USER EXISTENCE
  const user =
    type === "matNumber"
      ? await findUserByMatNumber(identifier)
      : await findUserEmail(identifier);

  if (_.isEmpty(user)) return null;

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
    email: decrypt(user.email),
    matNumber: user.matNumber ? decrypt(user.matNumber) : "",
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

    const { name, matNumber, email, id } = await createUser(
      _.merge({}, body, { mustChangePassword: false })
    );

    return reply.code(201).send({
      success: true,
      data: {
        id: id,
        name: decrypt(name),
        matNumber: matNumber && decrypt(matNumber),
        email: decrypt(email),
      },
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
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

    if (_.isEmpty(accessToken))
      return reply.code(401).send({ message: "Invalid matNumber or password" });

    return reply.code(201).send({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}

//* LECTURER REGISTRATION HANDLER
export async function regLecturerHandler(
  req: FastifyRequest<{
    Body: CreateUserWithOutPass;
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

    const { name, email, id } = await createUser(
      _.merge({}, body, {
        password: "000000",
        confirmPassword: "000000",
        role: "LECTURER",
      })
    );

    return reply.code(201).send({
      success: true,
      data: {
        id: id,
        name: decrypt(name),
        email: decrypt(email),
      },
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
  }
}

//* ADMIN REGISTRATION HANDLER
export async function regAdminHandler(
  req: FastifyRequest<{
    Body: CreateUserWithOutPass;
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

    const { name, email, id } = await createUser(
      _.merge({}, body, {
        password: "000000",
        confirmPassword: "000000",
        role: "ADMIN",
      })
    );

    return reply.code(201).send({
      success: true,
      data: {
        id: id,
        name: decrypt(name),
        email: decrypt(email),
      },
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
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

    if (_.isEmpty(accessToken))
      return reply
        .code(401)
        .send({ success: false, message: "Invalid email or password" });

    return reply.code(201).send({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong " });
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

    return reply
      .code(201)
      .send({ success: true, message: "Password updated." });
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

    if (_.isEmpty(user))
      return reply
        .code(404)
        .send({ success: false, message: "User not found." });

    if (user.role === "STUDENT")
      return reply.code(403).send({
        success: false,
        message: "Students cannot be deleted.",
      });

    await deleteUser(id);

    return reply.code(201).send({
      success: true,
      message: `User with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: "Failed to delete user. Please try again later.",
      error,
    });
  }
}

//* EMAIL VERIFICATION HANDLER FOR CHANGING PASSWORD AND SENDING CODE
export async function forgotPasswordHandler(
  req: FastifyRequest<{
    Body: { email: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { email } = req.body;

    const user = await findUserEmail(email);

    if (_.isEmpty(user))
      return reply
        .code(404)
        .send({ success: false, message: "User not found." });

    const code = generateRandomCode();

    sendResetEmail({
      to: email,
      code,
    });

    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await createPasswordReset({ code, email, expiresAt });

    const maskedEmail = maskEmail(email);

    return reply.code(201).send({
      success: true,
      message: `A reset code has been sent to ${maskedEmail}`,
    });
  } catch (error) {
    reply.code(500).send({ success: false, message: "Something went wrong" });
  }
}

//* CODE VERIFICATION HANDLER FOR VERIFYING CODE SEND TO USER EMAIL
export async function verifyResetCodeHandler(
  req: FastifyRequest<{
    Body: { email: string; code: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { email, code } = req.body;

    const validCode = await verifyResetCode({ email });

    if (_.isEmpty(validCode))
      return reply
        .code(400)
        .send({ success: false, message: "Invalid or expired code" });

    const correctCode = await verifyPassword({
      candPassword: code,
      hash: validCode.code,
    });

    if (!correctCode)
      return reply
        .code(400)
        .send({ success: false, message: "Incorrect code" });

    return reply.code(201).send({ success: true, message: "Code verified" });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong" });
  }
}

//* PASSWORD RESET HANDLER
export async function resetPasswordHandler(
  req: FastifyRequest<{
    Body: ChangePasswordInput & { code: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { code, email, ...rest } = req.body;

    const reset = await verifyResetCode({ email });

    if (_.isEmpty(reset))
      return reply
        .code(400)
        .send({ success: false, message: "Invalid or expired code" });

    const correctCode = await verifyPassword({
      candPassword: code,
      hash: reset.code,
    });

    if (!correctCode)
      return reply
        .code(400)
        .send({ success: false, message: "Incorrect code" });

    await changePassword({ email, ...rest });

    await changeResetCodeStatus(reset.id);

    return reply
      .code(201)
      .send({ success: true, message: "Password reset successful" });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong" });
  }
}

//* GET ALL STUDENT HANDLER
export async function getAllStudentHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const student = await findStudent();

    const studentData = _.map(student, (data) => ({
      id: data.id,
      matNumber: decrypt(data.matNumber as string),
      name: decrypt(data.name),
      email: decrypt(data.email),
    }));

    return reply.code(200).send({ success: true, data: studentData });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong" });
  }
}
//* GET ALL LECTURER HANDLER
export async function getAllLecturerHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const lecturer = await findLecturer();

    const lectureData = _.map(lecturer, (data) => ({
      id: data.id,
      name: decrypt(data.name),
      email: decrypt(data.email),
    }));

    return reply.code(200).send({ success: true, data: lectureData });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong" });
  }
}
//* GET SPECIFIC USER
export async function getSpecificUserHandler(
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const user = await findUserById(id);

    if (_.isEmpty(user))
      return reply
        .code(404)
        .send({ success: false, message: "User not found." });

    const userData = {
      id: user.id,
      matNumber: user.matNumber ? decrypt(user.matNumber) : "",
      name: decrypt(user.name),
      email: decrypt(user.name),
      role: user.role,
    };

    return reply.code(200).send({ success: true, data: userData });
  } catch (error) {
    return reply
      .code(500)
      .send({ success: false, message: "Something went wrong" });
  }
}

//* UPDATE USER
export async function updateUserDetailsHandler(
  req: FastifyRequest<{
    Params: { id: string };
    Body: CreateUserWithOutPass;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = req.params;
    const { email, name, matNumber } = req.body;

    const user = await findUserById(id);

    if (_.isEmpty(user))
      return reply
        .code(404)
        .send({ success: false, message: "User not found." });

    const emailExist = await findUserEmail(email);
    const checkEmail = _.isEqual(decrypt(user.email), email);

    if (!checkEmail && emailExist)
      return reply.code(409).send({
        success: false,
        message: "A user with this email already exist",
      });

    if (matNumber) {
      const matNumberExist = await findUserByMatNumber(matNumber);
      const checkMatNumber = _.isEqual(
        decrypt(user.matNumber as string),
        matNumber
      );

      if (!checkMatNumber && matNumberExist)
        return reply.code(409).send({
          success: false,
          message: "A user with this matNumber already exist",
        });
    }

    const updated = await updateUserDetails(id, {
      name,
      matNumber,
      email,
    });

    return reply.send({
      success: true,
      data: {
        id: id,
        name: decrypt(updated.name),
        matNumber: updated.matNumber && decrypt(updated.matNumber),
        email: decrypt(updated.email),
      },
    });
  } catch (error) {
    return reply.code(500).send({ success: false, message: "Update failed" });
  }
}
