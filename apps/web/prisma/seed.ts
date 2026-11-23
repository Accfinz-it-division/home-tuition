import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Create sample teachers
  const teacher1 = await prisma.user.create({
    data: {
      name: "Mr. Kamal Perera",
      email: "kamal@hometuition.lk",
      password,
      role: "TEACHER",
      phone: "0771234567",
      nic: "199012345678",
      teacher: {
        create: {
          qualifications: "BSc Mathematics, University of Colombo",
          bio: "10+ years experience teaching A/L Combined Maths.",
          status: "VERIFIED",
        },
      },
    },
    include: { teacher: true },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Ms. Nimali Silva",
      email: "nimali@hometuition.lk",
      password,
      role: "TEACHER",
      phone: "0779876543",
      nic: "199123456789",
      teacher: {
        create: {
          qualifications: "BSc Physics, University of Peradeniya",
          bio: "Physics specialist for O/L and A/L students.",
          status: "VERIFIED",
        },
      },
    },
    include: { teacher: true },
  });

  // Create sample courses
  await prisma.course.createMany({
    data: [
      {
        title: "A/L Combined Maths - 2026",
        category: "A/L",
        grade: 12,
        description: "Complete A/L Combined Maths syllabus covering Pure Maths and Applied Maths. Includes past paper discussions, model papers, and monthly exams.",
        firstFee: 1500,
        regularFee: 2500,
        teacherId: teacher1.teacher!.id,
      },
      {
        title: "O/L Mathematics - Grade 10",
        category: "O/L",
        grade: 10,
        description: "Comprehensive O/L mathematics course with step-by-step theory and problem-solving techniques.",
        firstFee: 1000,
        regularFee: 1800,
        teacherId: teacher1.teacher!.id,
      },
      {
        title: "A/L Physics - Theory & Revision",
        category: "A/L",
        grade: 12,
        description: "Complete A/L Physics covering theory, numericals, and revision with past paper discussions.",
        firstFee: 1500,
        regularFee: 2500,
        teacherId: teacher2.teacher!.id,
      },
      {
        title: "O/L Science - Grade 11",
        category: "O/L",
        grade: 11,
        description: "Full O/L Science syllabus with practical demonstrations and exam-focused revision.",
        firstFee: 1200,
        regularFee: 2000,
        teacherId: teacher2.teacher!.id,
      },
      {
        title: "Grade 5 Scholarship - Complete Prep",
        category: "Scholarship",
        grade: 5,
        description: "Complete scholarship preparation covering Maths, Environment, Sinhala, and Tamil.",
        firstFee: 800,
        regularFee: 1500,
        teacherId: teacher1.teacher!.id,
      },
      {
        title: "Spoken English for Beginners",
        category: "Language",
        description: "Practical spoken English course focusing on daily conversation, grammar, and confidence.",
        firstFee: 1000,
        regularFee: 1800,
        teacherId: teacher2.teacher!.id,
      },
    ],
  });

  console.log("✅ Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });