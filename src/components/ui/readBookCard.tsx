import Image from "next/image";
import { Card, CardDescription, CardTitle } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";

type ReadBookCardPropType = {
  imagePath: string;
  title: string;
  author: string;
  progress: number;
};

export default function ReadBookCard({ imagePath, title, author, progress }: ReadBookCardPropType) {
  return (
    <Card className="relative rounded-t-lg px-0 py-0 mt-4 shadow-md bg-[#E1E3E4]">
      <Image
        src={imagePath}
        alt={title}
        width={600}
        height={500}
        className="w-full object-cover rounded-t-lg"
      />
      <div className="p-4">
        <CardTitle className="">{title}</CardTitle>
        <CardDescription className="mt-0">{author}</CardDescription>
        <div className="my-4">
          <Progress value={progress} className="w-[100%] text-[#4E5256] bg-white rounded-lg" />
          <p className="mt-1">30% read</p>
        </div>
        <Badge className="absolute bg-white text-primary font-normal text-sm px-3 py-1 top-5 right-8">
          BOOK
        </Badge>
      </div>
    </Card>
  );
}
