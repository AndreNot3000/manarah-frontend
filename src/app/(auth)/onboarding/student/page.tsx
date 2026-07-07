import OnboardingSuccess from "@/components/onboarding/onboardingSuccess";
import { UserRoundPen } from "lucide-react";
import { FaRegCompass } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi2";

export default function OnboardingStudent() {
  const studentChecklist = [
    {
      title: "Complete your profile",
      description: "Add your interests and goals.",
      icon: UserRoundPen,
    },
    {
      title: "Browse competitions",
      description: "Find upcoming Islamic competitions.",
      icon: FaRegCompass,
    },
    {
      title: "Find a mentor",
      description: "Connect with qualified tutors.",
      icon: HiOutlineUsers,
    },
  ];

  return (
    <section className="flex flex-col items-center py-5">
      <h1 className="text-primary text-center text-2xl sm:text-4xl">MANARAH</h1>
      <OnboardingSuccess
        name="Abdullahi"
        role="student"
        heading="Welcome to Manarah"
        description="Your account has been successfully created. You're now part of a global community
                  dedicated to Islamic excellence."
        checklist={studentChecklist}
        buttonText="Go to Dashboard"
        buttonHref="/dashboard"
      />
    </section>
  );
}
