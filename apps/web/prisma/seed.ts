import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data (optional, careful in production)
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // 1. Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      name: "Mr. Kamal Perera",
      email: "kamal@test.com",
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
      email: "nimali@test.com",
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

  // 2. Create Courses (Using New Enums)
  await prisma.course.createMany({
    data: [
      {
        title: "A/L Combined Maths - 2026",
        category: "AL", // ✅ Updated
        subject: "Combined Maths",
        grade: 12,
        medium: "SINHALA",
        description: "Complete A/L Combined Maths syllabus.",
        firstFee: 1500,
        regularFee: 2500,
        teacherId: teacher1.teacher!.id,
      },
      {
        title: "O/L Mathematics - Grade 10",
        category: "OL", // ✅ Updated
        subject: "Mathematics",
        grade: 10,
        medium: "SINHALA",
        description: "Comprehensive O/L mathematics course.",
        firstFee: 1000,
        regularFee: 1800,
        teacherId: teacher1.teacher!.id,
      },
      {
        title: "A/L Physics - Theory & Revision",
        category: "AL", // ✅ Updated
        subject: "Physics",
        grade: 12,
        medium: "ENGLISH",
        description: "Complete A/L Physics covering theory and revision.",
        firstFee: 1500,
        regularFee: 2500,
        teacherId: teacher2.teacher!.id,
      },
      {
        title: "O/L Science - Grade 11",
        category: "OL", // ✅ Updated
        subject: "Science",
        grade: 11,
        medium: "TAMIL",
        description: "Full O/L Science syllabus.",
        firstFee: 1200,
        regularFee: 2000,
        teacherId: teacher2.teacher!.id,
      },
      {
        title: "Grade 5 Scholarship - Complete Prep",
        category: "PRIMARY", // ✅ Updated (Scholarship -> PRIMARY)
        subject: "General",
        grade: 5,
        medium: "SINHALA",
        description: "Complete scholarship preparation.",
        firstFee: 800,
        regularFee: 1500,
        teacherId: teacher1.teacher!.id,
      },
      {
        title: "Spoken English for Beginners",
        category: "LANGUAGE", // ✅ Updated
        subject: "English",
        grade: null,
        medium: "ENGLISH",
        description: "Practical spoken English course.",
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