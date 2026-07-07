"use client";

import { Button, ButtonLink, Card, CardDescription, CardHeader, Input } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth";
import clsx from "clsx";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordFormData) {
    console.log(data);
  }
  return (
    <section className="sm:max-w-2xl lg:max-w-xl mx-auto mt-8">
      <h1 className="mb-5 text-primary text-center font-semibold text-2xl sm:text-2xl sm:text-[2rem]">
        MANARAH
      </h1>
      <Card className="my-5 lg:max-w-2xl">
        <CardHeader className="text-[1.75rem] font-bold">Forgot Password?</CardHeader>
        <CardDescription className="text-base sm:text-[1.125rem]">
          Enter the email address associated with your account and we'll send you a password reset
          link.
        </CardDescription>
        <form onSubmit={handleSubmit(onSubmit)} className="my-5">
          <label className="my-3 block" htmlFor="email">
            <Input
              className={clsx("border-2 h-14 text-sm font-medium caret-primary", {
                " border-red-500 focus-visible:ring-0": errors.email,
              })}
              id="email"
              type="email"
              placeholder="Email Address"
              name="email"
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-xs my-2">{errors.email.message}</p>}
          </label>
          <Button
            // href="/forgot-password/confirmation"
            className="w-full h-14 my-3 text-white text-sm font-semibold"
          >
            Send Reset Link
          </Button>
        </form>
        <ButtonLink
          className="text-sm bg-transparent w-full font-semibold text-primary hover:bg-transparent"
          href="/login"
        >
          <ArrowLeft className="mr-1" size={16} aria-hidden="false" />
          Back to Login
        </ButtonLink>
      </Card>
    </section>
  );
}
