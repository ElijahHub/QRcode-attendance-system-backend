import _ from "lodash";

export function structureName(name: string) {
  return _.capitalize(_.toLower(name));
}

export function generateRandomCode() {
  return _.random(100000, 999999).toString();
}

export async function sendResetEmail(email: string, code: string) {
  console.log(`Sending reset code ${code} to ${email}`);
}
