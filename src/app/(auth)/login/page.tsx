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
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { togglePassword } from "@/lib/utils";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import clsx from "clsx";

import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/api";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessMessage(
        "Your password has been reset successfully. Please log in with your new password."
      );
    }
  }, [searchParams]);

  async function onSubmit(data: LoginFormData) {
    try {
      setLoginError(null);
      const result = await loginUser({
        email: data.email,
        password: data.password,
      });

      // Store JWT token and user info in localStorage & cookies
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      document.cookie = `token=${result.token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(result.user))}; path=/; max-age=604800; SameSite=Lax`;

      // Trigger a storage event so that header/components update in real-time
      window.dispatchEvent(new Event("storage"));

      // Role-based redirect
      if (result.user.role === "ADMIN") {
        router.push("/admin-dashboard");
      } else if (result.user.role === "TUTOR") {
        router.push("/tutor-dashboard");
      } else {
        router.push("/student-dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to the server. Please try again.";
      setLoginError(message);
    }
  }

  return (
    <div className="sm:max-w-2xl lg:max-w-xl mx-auto mt-5">
      <div className="text-center">
        <h1 className="text-primary text-xl sm:text-3xl">MANARAH</h1>
        <p className="text-secondary text-sm font-semibold">LEARN • TEACH • COMPETE</p>
      </div>

      <section className="my-5">
        {successMessage && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm my-3 font-semibold text-center border border-green-200">
            {successMessage}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-text text-xl font-semibold sm:text-2xl">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Access your learning portal
            </CardDescription>
          </CardHeader>

          {loginError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold text-center animate-fade-in flex items-center justify-center gap-2 my-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              {loginError === "Unauthorized" ||
              loginError.includes("401") ||
              loginError.toLowerCase().includes("credentials") ||
              loginError.toLowerCase().includes("invalid")
                ? "Invalid email or password. Please try again."
                : loginError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="my-5">
            <label htmlFor="email" className="my-3 block">
              <Input
                className={clsx("text-muted border-2 text-sm font-medium font-mono caret-primary", {
                  "focus-visible:ring-0 border-red-500": errors.email,
                })}
                type="email"
                {...register("email")}
                placeholder="Email Address"
                id="email"
              />
              {errors.email && <p className="text-red-500 text-xs my-2">{errors.email.message}</p>}
            </label>
            <label htmlFor="password" className="my-3 block relative">
              <Input
                className={clsx("text-muted border-2 text-sm font-medium font-mono caret-primary", {
                  "focus-visible:ring-0 border-red-500": errors.password,
                })}
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                id="password"
              />
              {!showPassword && (
                <Eye
                  aria-hidden={true}
                  aria-label="Show password"
                  onClick={() => togglePassword(setShowPassword)}
                  size={16}
                  className="absolute top-4 right-2 hover:cursor-pointer hover:text-primary"
                />
              )}
              {showPassword && (
                <EyeOff
                  aria-hidden={true}
                  aria-label="hide password"
                  onClick={() => togglePassword(setShowPassword)}
                  size={16}
                  className="absolute top-4 right-2 hover:cursor-pointer hover:text-primary"
                />
              )}
              {errors.password && (
                <p className="text-red-600 text-xs my-2">{errors.password.message}</p>
              )}
            </label>
            <div className="my-5 flex justify-between">
              <label
                htmlFor="remember-me"
                className="flex items-center justify-between text-text font-medium text-xs hover:cursor-pointer hover:text-primary"
              >
                <Input
                  id="remember-me"
                  {...register("rememberMe")}
                  type="checkbox"
                  className="mr-2 h-4  w-4"
                />
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
              disabled={isSubmitting}
              className="text-white w-full font-semibold text-xs flex items-center justify-center gap-1.5 sm:text-sm"
              size="md"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in to portal...</span>
                </>
              ) : (
                <>
                  <span>Sign in to portal</span>
                  <ArrowRight size={18} aria-label="hidden" />
                </>
              )}
            </Button>
            <div className="my-9 flex items-center justify-center gap-3">
              <span className="w-[20%] h-0.5 bg-gray-300 block"></span>
              <p className="text-text text-xs">OR CONTINUE WITH</p>
              <span className="w-[20%] h-0.5 bg-gray-300 block"></span>
            </div>
            <Button className="bg-background border-border border w-[80%] flex mx-auto hover:bg-muted">
              <Image src="/assets/images/icons8-google.svg" alt="Google" width={18} height={18} />
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
            <li>
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

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-10 font-semibold">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
