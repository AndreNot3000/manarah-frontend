import { Badge, ButtonLink, Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Clock } from "lucide-react";
import Image from "next/image";

type CourseCardPropType = {
  imagePath: string;
  title: string;
  description: string;
  duration: number;
  cta: string;
};

export default function CourseCard({
  imagePath,
  title,
  description,
  duration,
  cta,
}: CourseCardPropType) {
  return (
    <Card className="relative px-0 py-0 my-6 rounded-t-lg shadow-md bg-[#EDEEEF]">
      <Image
        src={imagePath}
        alt={title}
        width={600}
        height={500}
        className="rounded-lg object-cover"
      />
      <div className="p-8">
        <Badge className="absolute bg-white text-primary font-normal text-base px-3 py-1 top-5 right-8">
          COURSE
        </Badge>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardDescription>{description}</CardDescription>
        <div className="flex items-center justify-between mt-4">
          <p className="flex items-center gap-1 text-sm">
            <Clock arial-hidden="true" size={14} />
            {duration} Hours
          </p>
          <ButtonLink
            href="/"
            variant="ghost"
            className="font-normal text-sm text-primary py-1 px-3 rounded-xl w-auto h-auto bg-white hover:bg-white"
          >
            {cta}
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
