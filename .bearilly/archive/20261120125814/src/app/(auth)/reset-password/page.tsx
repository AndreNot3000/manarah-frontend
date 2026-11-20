"use client";

import { Button, Card, CardDescription, CardHeader, Input } from "@/components/ui";
import { togglePassword } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) {
      setError("password", {
        type: "manual",
        message: "Reset token is missing. Please request a new password reset link.",
      });
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: data.password,
      });
      router.push("/login?reset=success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed. The token may be expired or invalid.";
      setError("password", {
        type: "manual",
        message,
      });
    }
  }

  return (
    <Card className="my-5 lg:max-w-2xl">
      <CardHeader className="text-[1.75rem] font-bold">Reset Password</CardHeader>
      <CardDescription className="text-base sm:text-[1.125rem]">
        Enter your new password below.
      </CardDescription>

      {!token && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm my-3 font-medium">
          Error: Reset token is missing. Please check your email link or request a new password reset.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="my-5">
        <label htmlFor="password" className="my-3 block relative">
          <Input
            className={clsx("text-body border-2 caret-primary text-sm", {
              "border-red-500 focus-visible:ring-0": errors.password,
            })}
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="New Password"
            id="password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs my-2">{errors.password.message}</p>
          )}
          {!showPassword && (
            <Eye
              onClick={() => togglePassword(setShowPassword)}
              aria-hidden={true}
              aria-label="Show password"
              className="absolute hover:text-primary hover:cursor-pointer right-4 top-4"
              size={16}
            />
          )}
          {showPassword && (
            <EyeOff
              onClick={() => togglePassword(setShowPassword)}
              aria-hidden={true}
              aria-label="hide password"
              className="absolute hover:text-primary hover:cursor-pointer right-4 top-4"
              size={16}
            />
          )}
        </label>

        <label htmlFor="confirmPassword" className="my-3 block relative">
          <Input
            className={clsx("text-body border-2 caret-primary text-sm", {
              "border-red-500 focus-visible:ring-0": errors.confirmPassword,
            })}
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="Confirm Password"
            id="confirmPassword"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs my-2">{errors.confirmPassword.message}</p>
          )}
          {!showConfirmPassword && (
            <Eye
              onClick={() => togglePassword(setShowConfirmPassword)}
              aria-hidden={true}
              aria-label="Show password"
              className="absolute hover:text-primary hover:cursor-pointer right-4 top-4"
              size={16}
            />
          )}
          {showConfirmPassword && (
            <EyeOff
              onClick={() => togglePassword(setShowConfirmPassword)}
              aria-hidden={true}
              aria-label="hide password"
              className="absolute hover:text-primary hover:cursor-pointer right-4 top-4"
              size={16}
            />
          )}
        </label>

        <Button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full h-14 my-3 text-white text-sm font-semibold flex items-center justify-center"
        >
          {isSubmitting ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPassword() {
  return (
    <section className="sm:max-w-2xl lg:max-w-xl mx-auto mt-8">
      <h1 className="mb-5 text-primary text-center font-semibold text-2xl sm:text-2xl sm:text-[2rem]">
        MANARAH
      </h1>
      <Suspense fallback={<div className="text-center py-10 font-semibold">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
