"use client";

import { Button, ButtonLink, Card, CardDescription, CardHeader, Input } from "@/components/ui";
import { togglePassword } from "@/lib/utils";
import clsx from "clsx";
import { Earth, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { IoShieldCheckmark } from "react-icons/io5";
import { FaGlobeAfrica } from "react-icons/fa";

function SelectExpertise() {
  return (
    <fieldset className="my-3">
      <legend className="text-primary font-semibold">Select Expertise</legend>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <label htmlFor="quran" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input className="w-4 h-4 accent-primary" id="quran" type="checkbox" name="expertise" />
          Quran
        </label>
        <label htmlFor="tajweed" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input className="w-4 h-4 accent-primary" id="tajweed" type="checkbox" name="expertise" />
          Tajweed
        </label>
        <label htmlFor="arabic" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input className="w-4 h-4 accent-primary" id="arabic" type="checkbox" name="expertise" />
          Arabic
        </label>
        <label htmlFor="hifiz" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input className="w-4 h-4 accent-primary" id="hifiz" type="checkbox" name="expertise" />
          Hifiz
        </label>
      </div>
    </fieldset>
  );
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor">("student");
  const [isTutor, setIsTutor] = useState<boolean>(false);

  function toggleRole(e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.classList.contains("tutor")) {
      setSelectedRole("tutor");
      setIsTutor(true);
    } else {
      setSelectedRole("student");
      setIsTutor(false);
    }
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
        <div className="w-full rounded-full bg-slate-300 my-8 p-0.5 text-sm font-semibold">
          <Button
            onClick={toggleRole}
            className={clsx("student w-1/2 rounded-full", {
              "bg-transparent hover:bg-transparent": isTutor,
              "bg-primary hover:bg-primary text-white": !isTutor,
            })}
          >
            Student
          </Button>
          <Button
            onClick={toggleRole}
            className={clsx("tutor w-1/2 rounded-full bg-transparent", {
              "bg-primary hover:bg-primary text-white": isTutor,
              "bg-transparent hover:bg-transparent": !isTutor,
            })}
          >
            Tutor
          </Button>
        </div>
        <form>
          <label htmlFor="full-name" className="my-3.5 block">
            <Input
              className="text-body caret-primary text-sm"
              type="text"
              placeholder="Full Name"
            />
          </label>
          <label htmlFor="email" className="my-3.5 block">
            <Input
              className="text-body caret-primary text-sm"
              type="email"
              placeholder="Email Address"
            />
          </label>
          <label htmlFor="phone-number" className="my-3.5 block">
            <Input
              className="text-body caret-primary text-sm"
              type="number"
              placeholder="Phone Number"
            />
          </label>
          <label htmlFor="password" className="my-3.5 block relative">
            <Input
              className="text-body caret-primary text-sm"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />

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

          {selectedRole === "tutor" && <SelectExpertise />}
          <Button className="w-full text-white my-3 text-sm font-semibold">Register Now</Button>
          <p className="flex items-center justify-center text-sm sm:text-base">
            Already have an account?
            <ButtonLink className="h-0 w-auto text-primary hover:underline" href="/login">
              Log in
            </ButtonLink>
          </p>
        </form>
      </Card>
      <ul className="my-8 flex justify-evenly items-center">
        <li className="flex items-center gap-3 text-xs sm:text-sm">
          <IoShieldCheckmark size={14} className="" aria-label="hidden" />
          Secure Data
        </li>
        <li className="flex items-center gap-3 text-xs sm:text-sm">
          <FaGlobeAfrica size={14} aria-label="hidden" />
          Global Network
        </li>
      </ul>
    </section>
  );
}
