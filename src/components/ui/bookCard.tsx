import Image from "next/image";
import { Card, CardDescription, CardTitle } from "./card";
import { Badge } from "./badge";

type BookCardPropType = {
  imagePath: string;
  title: string;
  author: string;
};

export default function BookCard({ imagePath, alt, title, author }: BookCardPropType) {
  return (
    <Card className="relative rounded-t-lg px-0 py-0 mt-4 shadow-md bg-[#E1E3E4]">
      <Image
        src={imagePath}
        alt={alt}
        width={600}
        height={500}
        className="w-full object-cover rounded-t-lg"
      />
      <div className="p-4">
        <CardTitle className="">{title}</CardTitle>
        <CardDescription className="mt-0">{author}</CardDescription>
      </div>
      <Badge className="absolute bg-white text-primary font-normal text-sm px-3 py-1 top-5 right-8">
        BOOK
      </Badge>
    </Card>
  );
}
