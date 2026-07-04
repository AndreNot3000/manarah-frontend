import { Button, ButtonLink, Card, CardDescription, CardHeader } from "@/components/ui";
import { ArrowRight, MailCheck } from "lucide-react";

export default function confirmation() {
  return (
    <section className="flex flex-col items-center mx-auto sm:max-w-2xl lg:max-w-xl my-8">
      <h1 className="mb-5 text-primary text-center font-semibold text-2xl sm:text-2xl sm:text-[2rem]">
        MANARAH
      </h1>
      <Card className="md:max-w-[420px]">
        <div className="text-center my-5">
          <span className="inline-flex bg-slate-200 p-9 rounded-full">
            <MailCheck className="text-primary" size={54} aria-hidden="false" />
          </span>
        </div>
        <CardHeader className="text-2xl text-center font-semibold">Check your email</CardHeader>
        <CardDescription className="text-base text-center">
          We've sent a password reset link to your email address. Please check your inbox and follow
          the instructions to reset your password.
        </CardDescription>
        <ButtonLink
          className="w-full md:w-[340px] h-14 my-8 mx-auto text-white text-sm flex items-center gap-1"
          href="/login"
        >
          Back to Login
          <ArrowRight size={18} aria-hidden="false" />
        </ButtonLink>
        <CardDescription className="text-center text-xs font-medium">
          Didn&apos;t you receive an email?
        </CardDescription>
        <CardDescription className="text-center text-xs font-medium">
          Check your spam or
          <Button className="bg-transparent text-primary hover:bg-transparent px-1 py-0 hover:underline">
            resend the link.
          </Button>
        </CardDescription>
      </Card>
    </section>
  );
}
