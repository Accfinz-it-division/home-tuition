import "dotenv/config";
import { prisma } from "./lib/prisma.ts"; // <-- Added .ts extension here
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  // Update admin password
  const updated = await prisma.user.update({
    where: { email: "admin@hometuition.lk" },
    data: { password: hash },
  });

  console.log("✅ Admin password fixed!");
  console.log("   Email: admin@hometuition.lk");
  console.log("   Password: admin123");

  // Also fix the teachers (optional)
  const teacherHash = await bcrypt.hash("password123", 10);
  
  await prisma.user.updateMany({
    where: {
      email: { in: ["sunil@hometuition.lk", "dilini@hometuition.lk", "chaminda@hometuition.lk"] },
    },
    data: { password: teacherHash },
  });

  console.log("✅ Teacher passwords fixed! (password123)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());