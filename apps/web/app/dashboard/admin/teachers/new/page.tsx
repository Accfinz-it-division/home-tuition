import { TeacherForm } from "../teacher-form";

export default function NewTeacherPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">Add New Teacher</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Create a new teacher account
      </p>
      <TeacherForm mode="create" />
    </div>
  );
}