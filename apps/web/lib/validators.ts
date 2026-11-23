import { z } from "zod";

// Validation schema for user registration
export const registerSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(9, "Invalid phone").optional().or(z.literal("")),
  // Sri Lankan NIC validation: 12 digits OR 9 digits followed by V or X
  nic: z
    .string()
    .regex(/^(\d{9}[VvXx]|\d{12})$/, "Invalid NIC (12 digits or 9 digits + V/X)")
    .optional()
    .or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Min 6 characters"),
  role: z.enum(["STUDENT", "PARENT", "TEACHER"]),
  parentNic: z.string().optional(),
  grade: z.string().optional(),
});

// Validation schema for login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});