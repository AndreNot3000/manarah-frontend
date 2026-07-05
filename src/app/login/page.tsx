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
import { useState } from "react";
import { togglePassword } from "@/lib/utils";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

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
          <form className="my-5">
            <label htmlFor="email" className="my-3 block">
              <Input
                className="text-muted text-sm font-medium font-mono caret-primary"
                type="text"
                placeholder="Email Address"
                id="email"
                name="email"
              />
            </label>
            <label htmlFor="password" className="my-3 block relative">
              <Input
                className="text-muted text-sm font-medium font-mono caret-primary"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                id="password"
                name="password"
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
            </label>
            <div className="my-5 flex justify-between">
              <label
                htmlFor="remember-me"
                className="flex items-center justify-between text-text font-medium text-xs hover:cursor-pointer hover:text-primary"
              >
                <Input id="remember-me" type="checkbox" className="mr-2 h-4  w-4" />
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
              className="text-white w-full font-semibold text-xs flex items-center gap-1.5 sm:text-sm"
              size="md"
            >
              Sign in to portal
              <ArrowRight size={18} aria-label="hidden" />
            </Button>
            <div className="my-9 flex items-center justify-center gap-3">
              <span className="w-[20%] h-0.5 bg-gray-300 block"></span>
              <p className="text-text text-xs">OR CONTINUE WITH</p>
              <span className="w-[20%] h-0.5 bg-gray-300 block"></span>
            </div>
            <Button className="bg-background border-border border w-[80%] flex mx-auto hover:bg-muted">
              <Image src="/assets/Images/icons8-google.svg" alt="Google" width={18} height={18} />
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
