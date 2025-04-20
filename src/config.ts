import dotenv from "dotenv";

dotenv.config();

export const CORS_ORIGIN = "http://localhost:3000";

export const privateKeyPath = process.env.PRIVATE_KEY_PATH as string;

export const publicKeyPath = process.env.PUBLIC_KEY_PATH as string;

export const ENCRYPTION_KEY = process.env.AES_SECRET_KEY;

export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost";
