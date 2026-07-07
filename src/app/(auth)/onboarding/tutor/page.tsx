import OnboardingSuccess from "@/components/onboarding/onboardingSuccess";
import { GraduationCap, LibraryBig } from "lucide-react";
import { LuCalendarCheck } from "react-icons/lu";

export default function OnboardingTutor() {
  const tutorChecklist = [
    {
      icon: GraduationCap,
      title: "Set up your teaching profile",
      description: "Upload certificates and background.",
    },
    {
      icon: LibraryBig,
      title: "Set your availability",
      description: "Define your teaching schedule.",
    },
    {
      icon: LuCalendarCheck,
      title: "Manage your courses",
      description: "Create and organize learning materials.",
    },
  ];
  return (
    <section className="flex flex-col items-center py-5">
      <h1 className="text-primary text-center text-2xl sm:text-4xl">MANARAH</h1>
      <OnboardingSuccess
        name="Dr. Ahmed"
        role="tutor"
        heading="Welcome to Manarah"
        description="Your tutor account has been successfully created. You're now ready to share your knowledge with a global community of students."
        checklist={tutorChecklist}
        buttonText="Go to Dashboard"
        buttonHref="/dashboard"
      />
    </section>
  );
}
