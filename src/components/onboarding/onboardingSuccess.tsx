import { ButtonLink, Card, CardContent, CardDescription, CardTitle } from "@/components/ui";
import { ArrowRight, CircleCheck } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

type OnboardingSuccessPropType = {
  name: string;
  role: string;
  heading: string;
  description: string;
  checklist: OnboardingItemPropType[];
  buttonText: string;
  buttonHref: string;
};

type OnboardingItemPropType = {
  icon: LucideIcon | IconType;
  title: string;
  description: string;
};

export default function OnboardingSuccess({
  name,
  heading,
  description,
  checklist,
  buttonText,
  buttonHref,
}: OnboardingSuccessPropType) {
  return (
    <>
      <Card className="my-5 sm:max-w-[35rem]">
        <div className="text-center">
          <span className="bg-slate-200 p-8 rounded-full inline-block">
            <CircleCheck className="text-primary" size={52} aria-hidden="false" />
          </span>
        </div>
        <CardTitle className="text-base text-center font-normal my-3 md:text-2xl">
          {`${heading}, ${name}!`}
        </CardTitle>
        <CardDescription className="text-center text-sm max-w-96 mx-auto md:text-base">
          {description}
        </CardDescription>
        <CardContent className="my-5">
          <CardTitle className="text-primary text-base sm:text-[1.125rem]">
            WHAT&apos;S NEXT?
          </CardTitle>
          <ul className="px-3">
            {checklist.map((item, index) => {
              const Icon = item.icon;

              return (
                <li key={index} className="my-6">
                  <ButtonLink
                    href=""
                    className="group py-8 justify-start gap-3 text-left w-full bg-transparent hover:bg-slate-200"
                  >
                    <span className="bg-slate-200 p-3 rounded-md text-primary group-hover:bg-primary group-hover:text-white">
                      <Icon size={18} aria-hidden="false" />
                    </span>

                    <div>
                      <h4 className="text-[#333333] text-base">{item.title}</h4>

                      <p className="text-sm">{item.description}</p>
                    </div>
                  </ButtonLink>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <ButtonLink
          href={buttonHref}
          className="text-white text-base font-normal flex items-center gap-1 w-full h-14"
        >
          {buttonText}
          <ArrowRight size={18} />
        </ButtonLink>
      </Card>

      <p className="text-center font-normal mt-6 text-sm">
        Need Help?
        <ButtonLink
          className="p-0 pl-1 h-0 text-primary bg-transparent hover:underline hover:bg-transparent"
          href=""
        >
          Contact Support
        </ButtonLink>
      </p>
    </>
  );
}
