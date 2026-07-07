"use client";

import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  ButtonLink,
} from "@/components/ui";
import { authApi } from "@/lib/api";
import { togglePassword } from "@/lib/utils";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FieldErrors = { email?: string; password?: string };

// ---------------------------------------------------------------------------
// Role-based redirect
// ---------------------------------------------------------------------------

function redirectPath(role: string): string {
  switch (role) {
    case "TUTOR":
      return "/tutor/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/dashboard";
  }
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function clearFieldError(field: keyof FieldErrors) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    // Client-side validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });

      // Persist token and user
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Role-based redirect
      router.push(redirectPath(response.user.role));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sm:max-w-2xl lg:max-w-xl mx-auto mt-5">
      <div className="text-center">
        <h1 className="text-primary text-xl sm:text-3xl">MANARAH</h1>
        <p className="text-secondary text-sm font-semibold">LEARN • TEACH • COMPETE</p>
      </div>

      <section className="my-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-text text-xl font-semibold sm:text-2xl">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Access your learning portal
            </CardDescription>
          </CardHeader>

          {/* API-level error */}
          {apiError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form className="my-5" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="my-3">
              <Input
                className="text-neutral-muted text-sm font-medium caret-primary"
                type="email"
                placeholder="Email Address"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                error={!!errors.email}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="my-3 relative">
              <Input
                className="text-neutral-muted text-sm font-medium caret-primary"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                error={!!errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => togglePassword(setShowPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-3.5 right-3 text-neutral-muted hover:text-primary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember me + forgot password */}
            <div className="my-5 flex justify-between items-center">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-2 text-neutral-text font-medium text-xs hover:cursor-pointer hover:text-primary"
              >
                <input id="remember-me" type="checkbox" className="h-4 w-4 accent-primary" />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-primary font-medium text-xs hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="text-white w-full font-semibold text-xs flex items-center gap-1.5 sm:text-sm"
              size="md"
            >
              {loading ? "Signing in..." : "Sign in to portal"}
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </Button>

            <div className="my-9 flex items-center justify-center gap-3">
              <span className="w-[20%] h-0.5 bg-gray-300 block" />
              <p className="text-neutral-text text-xs">OR CONTINUE WITH</p>
              <span className="w-[20%] h-0.5 bg-gray-300 block" />
            </div>

            <Button
              type="button"
              className="bg-neutral-background border border-neutral-border w-[80%] flex mx-auto hover:bg-neutral-50"
            >
              <Image
                src="/assets/images/icons8-google.svg"
                alt="Continue with Google"
                width={18}
                height={18}
              />
            </Button>
          </form>
        </Card>

        <div className="my-7">
          <div className="flex justify-center items-center text-base">
            <p>Don&apos;t have an account?</p>
            <ButtonLink
              href="/register"
              className="bg-transparent text-primary hover:bg-transparent hover:underline pl-2"
            >
              Create Account
            </ButtonLink>
          </div>
          <ul className="flex justify-evenly items-center">
            <li className="flex gap-2">
              <ButtonLink
                className="text-xs font-medium bg-transparent hover:bg-transparent hover:text-primary"
                href=""
              >
                Privacy Policy
              </ButtonLink>
              <ButtonLink
                className="text-xs font-medium bg-transparent hover:bg-transparent hover:text-primary"
                href=""
              >
                Terms of Service
              </ButtonLink>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
