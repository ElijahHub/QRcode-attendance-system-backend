import { PrismaClient } from "@prisma/client";
import { encrypt, generateHmac, genHash } from "../src/utils/auth";
const prisma = new PrismaClient();

async function main() {
  // Check if default admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@admin.com" },
  });

  const password = await genHash("123456789");

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: encrypt("admin@admin.com"),
        password: password,
        emailMac: generateHmac("admin@admin.com"),
        role: "ADMIN",
        mustChangePassword: false,
      },
    });

    console.log("✅ Default admin user created");
  } else {
    console.log("ℹ️ Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
