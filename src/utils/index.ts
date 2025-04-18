export function structureName(name: string) {
  return name
    .split(" ")
    .map((t, i) => t[0].toUpperCase() + t.slice(1))
    .join(" ");
}

export function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendResetEmail(email: string, code: string) {
  console.log(`Sending reset code ${code} to ${email}`);
}
