"use client";

import { Button, ButtonLink, Card, CardDescription, CardHeader, Input } from "@/components/ui";
import { authApi } from "@/lib/api";
import { togglePassword } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGlobeAfrica } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas (mirrors backend)
// ---------------------------------------------------------------------------

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

const studentSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  password: passwordSchema,
});

const tutorSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  password: passwordSchema,
});

type FormFields = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

// ---------------------------------------------------------------------------
// Expertise selector (tutor only — UI only for now, not sent to API)
// ---------------------------------------------------------------------------

function SelectExpertise() {
  return (
    <fieldset className="my-3">
      <legend className="text-primary font-semibold">Select Expertise</legend>
      <div className="grid grid-cols-2 gap-4 mt-3">
        {["Quran", "Tajweed", "Arabic", "Hifz"].map((subject) => (
          <label
            key={subject}
            htmlFor={subject.toLowerCase()}
            className="flex items-center gap-2 p-2 border-2 rounded-md hover:border-primary cursor-pointer"
          >
            <input
              className="w-4 h-4 accent-primary"
              id={subject.toLowerCase()}
              type="checkbox"
              name="expertise"
            />
            {subject}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Success screen
// ---------------------------------------------------------------------------

function SuccessScreen({ user, role }: { user: AuthUser; role: "student" | "tutor" }) {
  const router = useRouter();

  return (
    <section className="sm:max-w-2xl lg:max-w-xl mx-auto mt-5">
      <Card>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <IoShieldCheckmark size={36} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Account Created!</h2>
          <p className="text-neutral-muted text-sm max-w-sm">
            Welcome, <span className="font-semibold text-neutral-text">{user.name}</span>!
            {role === "tutor"
              ? " Your tutor account is pending verification. You'll be notified once approved."
              : " Your account is ready. Let's get started."}
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="mt-2 w-full text-white font-semibold"
          >
            Continue to Login
          </Button>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Register page
// ---------------------------------------------------------------------------

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor">("student");
  const [isTutor, setIsTutor] = useState(false);

  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);

  function toggleRole(e: React.MouseEvent<HTMLButtonElement>) {
    const isTutorBtn = e.currentTarget.classList.contains("tutor");
    setSelectedRole(isTutorBtn ? "tutor" : "student");
    setIsTutor(isTutorBtn);
    setErrors({});
    setApiError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    // Validate
    const schema = isTutor ? tutorSchema : studentSchema;
    const result = schema.safeParse(fields);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormFields;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { name, email, password, phone } = result.data;

      let response;
      if (isTutor) {
        response = await authApi.registerTutor({ name, email, password });
      } else {
        response = await authApi.registerStudent({
          name,
          email,
          password,
          phone: phone || undefined,
        });
      }

      // Store token for immediate use after login redirect
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      setRegisteredUser(response.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  // Show success screen after registration
  if (registeredUser) {
    return <SuccessScreen user={registeredUser} role={selectedRole} />;
  }

  return (
    <section className="sm:max-w-2xl lg:max-w-xl mx-auto mt-5">
      <Card>
        <CardHeader className="text-primary text-[28px] sm:text-[2rem] font-bold text-center">
          Create Account
        </CardHeader>
        <CardDescription className="text-sm text-center sm:text-base">
          Join our global community of learning and excellence.
        </CardDescription>

        {/* Role toggle */}
        <div className="w-full rounded-full bg-slate-300 my-8 p-0.5 text-sm font-semibold">
          <Button
            type="button"
            onClick={toggleRole}
            className={clsx("student w-1/2 rounded-full", {
              "bg-transparent hover:bg-transparent text-neutral-text": isTutor,
              "bg-primary hover:bg-primary text-white": !isTutor,
            })}
          >
            Student
          </Button>
          <Button
            type="button"
            onClick={toggleRole}
            className={clsx("tutor w-1/2 rounded-full", {
              "bg-primary hover:bg-primary text-white": isTutor,
              "bg-transparent hover:bg-transparent text-neutral-text": !isTutor,
            })}
          >
            Tutor
          </Button>
        </div>

        {/* API-level error */}
        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="my-3.5">
            <Input
              name="name"
              type="text"
              placeholder="Full Name"
              value={fields.name}
              onChange={handleChange}
              error={!!errors.name}
              className="text-sm caret-primary"
              autoComplete="name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="my-3.5">
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={fields.email}
              onChange={handleChange}
              error={!!errors.email}
              className="text-sm caret-primary"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone (optional) */}
          <div className="my-3.5">
            <Input
              name="phone"
              type="tel"
              placeholder="Phone Number (optional)"
              value={fields.phone}
              onChange={handleChange}
              error={!!errors.phone}
              className="text-sm caret-primary"
              autoComplete="tel"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="my-3.5 relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={fields.password}
              onChange={handleChange}
              error={!!errors.password}
              className="text-sm caret-primary"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => togglePassword(setShowPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-3.5 text-neutral-muted hover:text-primary"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Tutor expertise selector */}
          {selectedRole === "tutor" && <SelectExpertise />}

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-white my-3 text-sm font-semibold"
          >
            {loading ? "Creating account..." : "Register Now"}
          </Button>

          <p className="flex items-center justify-center text-sm sm:text-base">
            Already have an account?
            <ButtonLink className="h-0 w-auto text-primary hover:underline pl-1" href="/login">
              Log in
            </ButtonLink>
          </p>
        </form>
      </Card>

      <ul className="my-8 flex justify-evenly items-center">
        <li className="flex items-center gap-3 text-xs sm:text-sm">
          <IoShieldCheckmark size={14} aria-hidden="true" />
          Secure Data
        </li>
        <li className="flex items-center gap-3 text-xs sm:text-sm">
          <FaGlobeAfrica size={14} aria-hidden="true" />
          Global Network
        </li>
      </ul>
    </section>
  );
}
