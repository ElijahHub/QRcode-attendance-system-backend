import dotenv from "dotenv";

dotenv.config();

export const CORS_ORIGIN = "http://localhost:3000";

export const privateKeyPath = process.env.PRIVATE_KEY_PATH as string;

export const publicKeyPath = process.env.PUBLIC_KEY_PATH as string;

export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost";
