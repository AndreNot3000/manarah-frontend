import Image from "next/image";
import { Card, CardHeader, CardDescription, CardTitle } from "./card";
import { ArrowRight, CirclePlay, Clock, GraduationCap, Star, User } from "lucide-react";
import { ButtonLink } from "./button";
import { Badge } from "./badge";

type FeaturedProgramCardPropType = {
  imagePath: string;
  title: string;
  description: string;
  href: string;
  level: string;
  tutor: string;
  duration: number;
  numberOfLessons: number;
};

export default function FeaturedProgramCard({
  imagePath,
  title,
  description,
  href,
  level,
  tutor,
  duration,
  numberOfLessons,
}: FeaturedProgramCardPropType) {
  return (
    <Card className="relative border-0 px-0 py-0 mt-6 rounded-t-lg bg-[#EDEEEF] shadow-md md:flex gap-6">
      <Image
        src={imagePath}
        alt={title}
        width={600}
        height={500}
        className="w-full rounded-t-lg object-cover lg:w-[522px]"
      />
      <div className="p-8 lg:w-[552px]">
        <CardHeader>
          <CardTitle className="text-primary text-[1.125rem]">COURSE</CardTitle>
        </CardHeader>
        <h4 className="text-base my-1">{title}</h4>
        <CardDescription className="text-base">{description}</CardDescription>

        <div className="flex items-center justify-between my-4 lg:justify-start lg:gap-6">
          <div className="flex items-center">
            <User size={14} aria-hidden="true" className="mr-1" />
            <p className="text-sm">{tutor}</p>
          </div>
          <div className="flex items-center">
            <CirclePlay size={14} aria-hidden="true" className="mr-1" />
            <p className="text-sm">{numberOfLessons} Lessons</p>
          </div>
          <div className="flex items-center my-2">
            <Clock size={14} aria-hidden="true" className="mr-1" />
            <p className="text-sm">{duration} Hours</p>
          </div>
        </div>
        <div className="flex items-center bg-white p-2 rounded-lg w-[112px] my-4">
          <GraduationCap size={14} aria-hidden="true" className="mr-1" />
          <p className="text-sm">{level}</p>
        </div>
        <div className="text-center mt-8 md:text-left">
          <ButtonLink
            href={href}
            className="gap-1 rounded-full text-sm text-white w-full md:w-[80%]"
          >
            View Course Details <ArrowRight size={18} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
      <Badge className="absolute top-6 left-5 bg-[#755B00] text-white text-sm px-3 inline-flex items-center gap-1 font-normal">
        <Star size={14} aria-hidden="true" />
        Featured
      </Badge>
    </Card>
  );
}
