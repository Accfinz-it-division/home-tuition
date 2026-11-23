import "dotenv/config";
import { prisma } from "./lib/prisma.ts";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  console.log("Generated Hash:", hash, "\n");

  const emails = [
    "admin1@test.com",
    "admin2@test.com",
    "teacher1@test.com",
    "teacher2@test.com",
    "student1@test.com",
    "student2@test.com",
    "parent1@test.com",
    "parent2@test.com",
  ];

  for (const email of emails) {
    await prisma.user.update({
      where: { email },
      data: { password: hash },
    });
    console.log(`✅ Updated: ${email}`);
  }

  console.log("\n🎉 All 8 passwords updated to: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());