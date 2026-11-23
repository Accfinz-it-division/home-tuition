import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TeacherForm } from "../../teacher-form";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!teacher) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">Edit Teacher</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Update {teacher.user.name}'s details
      </p>
      <TeacherForm
        mode="edit"
        teacherId={teacher.id}
        defaultValues={{
          name: teacher.user.name,
          email: teacher.user.email,
          phone: teacher.user.phone || "",
          nic: teacher.user.nic || "",
          qualifications: teacher.qualifications || "",
          bio: teacher.bio || "",
          status: teacher.status,
        }}
      />
    </div>
  );
}