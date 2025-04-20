import crypto from "crypto";
import argon2 from "argon2";
import _ from "lodash";
import { ENCRYPTION_KEY } from "../config";
import { VerifyPassInput } from "../types";

//* Hash Generator Function
export async function genHash(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

//* Password Hash Verification Function
export function verifyPassword({ candPassword, hash }: VerifyPassInput) {
  return argon2.verify(hash, candPassword);
}

//? Checking if Encryption key is not Null
if (!ENCRYPTION_KEY) throw new Error("Encryption Key is Missing");

// Converting Key to Buffer
const SECRET_KEY = Buffer.from(ENCRYPTION_KEY, "base64");

//* Encryption Function
export function encrypt(data: string) {
  // Setting Initialization Vector
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);

  // Encrypting Data
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Combining IV and Encrypted Data for Sending
  const encryptedData = `${IV.toString("hex")}:${encrypted}`;
  return encryptedData;
}

//* Decryption Function
export function decrypt(data: string) {
  // Extracting IV and Encrypted data
  const [ivHex, encryptedData] = data.split(":");

  if (_.isEmpty(ivHex) || _.isEmpty(encryptedData))
    throw new Error("Invalid encrypted data format");

  const IV = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, IV);

  // Decrypting Data
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
