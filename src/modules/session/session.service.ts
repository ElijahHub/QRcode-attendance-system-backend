import _ from "lodash";
import prisma from "../../utils/prisma";
import { CreateSessionInput } from "./session.schema";

export async function createSession(
  input: CreateSessionInput & { lecturerId: string }
) {
  const { expiresAt, geolocationData, ...rest } = input;
  return await prisma.lectureSessions.create({
    data: _.merge({}, rest, {
      expiresAt: new Date(expiresAt),
      geolocationData: JSON.stringify(geolocationData),
    }),
  });
}
