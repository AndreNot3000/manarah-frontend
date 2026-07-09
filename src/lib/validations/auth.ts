import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required"),

    email: z.email("Invalid email"),

    phone: z
      .string()
      .trim()
      .regex(/^(?:\+234|234|0)\d{10}$/, "Enter a valid phone number"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`';]/,
        "Password must contain at least one special character"
      ),

    role: z.enum(["student", "tutor"]),

    expertise: z.array(z.enum(["Quran", "Tajweed", "Arabic", "Hifiz"])),
  })
  .superRefine((data, ctx) => {
    if (data.role === "tutor" && data.expertise.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["expertise"],
        message: "Select at least one expertise",
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`';]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
