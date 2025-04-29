import _ from "lodash";
import nodemailer, { SendMailOptions } from "nodemailer";
import { getDistance } from "geolib";
import { APP_PASSWORD, EMAIL_ACCOUNT } from "../config";

export function structureName(name: string) {
  return _.startCase(_.toLower(name));
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (_.isEmpty(localPart) || _.isEmpty(domain)) {
    return email;
  }

  if (localPart.length <= 2) {
    return `*${_.last(localPart)}@${domain}`;
  }

  const firstChar = _.first(localPart);
  const lastChar = _.last(localPart);
  return `${firstChar}***${lastChar}@${domain}`;
}

export function generateRandomCode() {
  return _.random(100000, 999999).toString();
}

export function validateProximity({
  studentLocation,
  sessionLocation,
  radMeter = 100,
}: {
  studentLocation: { latitude: number; longitude: number };
  sessionLocation: { latitude: number; longitude: number };
  radMeter: number;
}) {
  const distance = getDistance(
    {
      latitude: studentLocation.latitude,
      longitude: studentLocation.longitude,
    },
    { latitude: sessionLocation.latitude, longitude: sessionLocation.longitude }
  );

  return distance <= radMeter;
}

// Email sending functions
if (_.isEmpty(EMAIL_ACCOUNT) || _.isEmpty(APP_PASSWORD))
  throw new Error("Variables not define");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_ACCOUNT,
    pass: APP_PASSWORD,
  },
});

interface MailOptions {
  to: string;
  code: string;
}

export async function sendResetEmail({ to, code }: MailOptions) {
  try {
    const mailOptions: SendMailOptions = {
      from: `"Your App Name" <${EMAIL_ACCOUNT}>`,
      to: to,
      subject: "Your Password Reset Code",
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Password Reset Code</h2>
      <p>Your reset code is:</p>
      <h1 style="color: #2c3e50;">${code}</h1>
      <p>Please enter this code in the app to reset your password. This code will expire in 30 minutes.</p>
    </div>
  `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
