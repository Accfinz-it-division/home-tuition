/*
  Warnings:

  - Changed the type of `category` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('PRIMARY', 'SECONDARY', 'OL', 'AL', 'LANGUAGE', 'GOV_EXAM', 'SKILL');

-- CreateEnum
CREATE TYPE "Medium" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "medium" "Medium",
ADD COLUMN     "subject" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "CourseCategory" NOT NULL;
