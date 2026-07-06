"use client";

import { Button, ButtonLink, Card, CardDescription, CardHeader, Input } from "@/components/ui";
import { togglePassword } from "@/lib/utils";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { IoShieldCheckmark } from "react-icons/io5";
import { FaGlobeAfrica } from "react-icons/fa";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, RegisterFormData } from "@/lib/validations/auth";

function SelectExpertise({ register, errors }) {
  return (
    <fieldset className="my-3">
      <legend className="text-primary font-semibold">Select Expertise</legend>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <label htmlFor="quran" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input
            className="w-4 h-4 accent-primary"
            id="quran"
            {...register("expertise")}
            type="checkbox"
            name="expertise"
            value="Quran"
          />
          Quran
        </label>
        <label htmlFor="tajweed" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input
            className="w-4 h-4 accent-primary"
            {...register("expertise")}
            id="tajweed"
            type="checkbox"
            name="expertise"
            value="Tajweed"
          />
          Tajweed
        </label>
        <label htmlFor="arabic" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input
            className="w-4 h-4 accent-primary"
            {...register("expertise")}
            id="arabic"
            type="checkbox"
            name="expertise"
            value="Arabic"
          />
          Arabic
        </label>
        <label htmlFor="hifiz" className="flex items-center gap-2 p-2 border-2 rounded-md">
          <Input
            className="w-4 h-4 accent-primary"
            {...register("expertise")}
            id="hifiz"
            type="checkbox"
            name="expertise"
            Value="Hifiz"
          />
          Hifiz
        </label>
      </div>
      {errors.expertise && <p className="text-red-500 text-xs my-2">{errors.expertise.message}</p>}
    </fieldset>
  );
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor">("student");
  const [isTutor, setIsTutor] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    shouldUnregister: false,

    defaultValues: {
      role: "student",
      expertise: [],
    },
  });

  function onSubmit(data: RegisterFormData) {
    console.log(data);
  }

  function toggleRole(e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.classList.contains("tutor")) {
      setSelectedRole("tutor");
      setIsTutor(true);
      setValue("role", "tutor");
    } else {
      setSelectedRole("student");
      setIsTutor(false);
      setValue("role", "student");
      setValue("expertise", []);
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
            type="button"
          >
            Student
          </Button>
          <Button
            onClick={toggleRole}
            className={clsx("tutor w-1/2 rounded-full bg-transparent", {
              "bg-primary hover:bg-primary text-white": isTutor,
              "bg-transparent hover:bg-transparent": !isTutor,
            })}
            type="button"
          >
            Tutor
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="full-name" className="my-3.5 block">
            <Input
              className={clsx("text-body border-2 caret-primary text-sm", {
                " border-red-500 focus-visible:ring-0": errors.fullName,
              })}
              {...register("fullName")}
              type="text"
              placeholder="Full Name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs my-2">{errors.fullName.message}</p>
            )}
          </label>
          <label htmlFor="email" className="my-3.5 block">
            <Input
              className={clsx("text-body border-2 caret-primary text-sm", {
                " border-red-500 focus-visible:ring-0": errors.email,
              })}
              {...register("email")}
              type="email"
              placeholder="Email Address"
            />
            {errors.email && <p className="text-red-500 text-xs my-2">{errors.email.message}</p>}
          </label>
          <label htmlFor="phone-number" className="my-3.5 block">
            <Input
              className={clsx("text-body border-2 caret-primary text-sm", {
                "border-red-500 focus-visible:ring-0": errors.phone,
              })}
              {...register("phone")}
              type="text"
              placeholder="Phone Number"
            />
            {errors.phone && <p className="text-red-500 text-xs my-2">{errors.phone.message}</p>}
          </label>
          <label htmlFor="password" className="my-3.5 block relative">
            <Input
              className={clsx("text-body border-2 caret-primary text-sm", {
                "border-red-500 focus-visible:ring-0": errors.password,
              })}
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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

          {selectedRole === "tutor" && <SelectExpertise register={register} errors={errors} />}
          <Button type="submit" className="w-full text-white my-3 text-sm font-semibold">
            Register Now
          </Button>
          <p className="flex items-center justify-center text-sm sm:text-base">
            Already have an account?
            <ButtonLink className="h-0 w-auto px-1 text-primary hover:underline" href="/login">
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
