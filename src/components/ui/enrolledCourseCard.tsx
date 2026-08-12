import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { BadgeCheck } from "lucide-react";
import { ButtonLink } from "./button";
import { Progress } from "./progress";

type EnrolledCourseCardPropType = {
  imagePath: string;
  title: string;
  description: string;
  progress: number;
  cta: string;
  href: string;
};

export default function EnrolledCourseCard({
  imagePath,
  title,
  description,
  progress,
  cta,
  href,
}: EnrolledCourseCardPropType) {
  return (
    <Card className="relative px-0 py-0 my-4 rounded-t-lg shadow-md bg-[#EDEEEF]  md:my-0 ">
      <div className="relative">
        <Image
          src={imagePath}
          alt={title}
          width={600}
          height={500}
          className="rounded-lg object-cover w-full"
        />

        <Badge className="absolute bottom-3 left-8 gap-1 text-sm bg-white px-3 py-1">
          <BadgeCheck className="text-[#755B00]" size={14} />
          Enrolled
        </Badge>
      </div>
      <div className="px-8 py-4">
        <Badge className="absolute bg-white text-primary font-normal text-sm px-3 py-1 top-5 right-8">
          COURSE
        </Badge>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardDescription>{description} </CardDescription>
        <div className="mt-4 mb-3">
          <div className="flex items-center justify-between">
            <p>{progress}% Complete</p>
            <ButtonLink
              href={href}
              variant="ghost"
              className="font-bold text-primary hover:bg-[#EDEEEF]"
            >
              {cta}
            </ButtonLink>
          </div>
          <Progress value={progress} className="mt-1 w-[100%] rounded-md bg-white" />
        </div>
      </div>
    </Card>
  );
}
