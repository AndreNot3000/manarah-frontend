import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Progress, ProgressValue } from "@/components/ui/progress";
import Image from "next/image";
import { IoTrophy } from "react-icons/io5";
import { PiSealCheckFill } from "react-icons/pi";
import { GoLightBulb } from "react-icons/go";
import { Calendar } from "lucide-react";

export default function StudentDashboard() {
  return (
    <section>
      <h2 className="text-[1.75rem] text-center">Assalamu Alaikum, Omar</h2>
      <p className="text-center my-1">Your journey of illumination continues today.</p>
      {/* Active Competition */}
      <Card className="mt-6">
        <div className="flex gap-2">
          <div>
            <Badge className="text-primary tracking-[1.2] bg-green-100 p-1.5 font-medium rounded-sm text-xs">
              ACTIVE COMPETITION
            </Badge>
            <CardTitle className="text-2xl font-semibold my-2">
              International Quran Recitation 2024
            </CardTitle>
          </div>
          <span className="bg-[#FFDF90] px-2 pt-2 pb-3 rounded-lg self-start">
            <IoTrophy size={18} />
          </span>
        </div>
        <div className="mt-10 flex justify-between">
          <div>
            <CardDescription className="text-xs my-2">Time remaining to submit</CardDescription>
            <div>
              <p className="text-primary flex gap-2 font-bold text-2xl" aria-label="">
                <span className="flex flex-col gap-">
                  <span>02</span>
                  <span className="text-xs text-[#3F493F] font-medium">Days</span>
                </span>
                :
                <span className="flex flex-col gap-">
                  <span>14</span>
                  <span className="text-xs text-[#3F493F] font-medium">Hours</span>
                </span>
                :
                <span className="flex flex-col gap-">
                  <span>55</span>
                  <span className="text-xs text-[#3F493F] font-medium">Days</span>
                </span>
              </p>
            </div>
          </div>
          <ButtonLink
            className="text-white self-end px-6 text-sm font-semibold rounded-full"
            href=""
          >
            Join Now
          </ButtonLink>
        </div>
      </Card>
      {/* Certificates */}
      <Card className="my-4">
        <div className="text-center">
          <span className="inline-flex bg-slate-200 p-4 rounded-full">
            <PiSealCheckFill className="text-" size={32} />
          </span>
        </div>
        <CardTitle className="mt-4 text-center font-semibold text-2xl">12</CardTitle>
        <p className="text-center">Earned Certificates</p>
        <Progress value={70} className="mt-6 mb-3 w-full rounded-lg bg-slate-200" />
        <p className="text-center text-xs font-medium">Next at 15 certificates</p>
      </Card>
      {/* Mentors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between text-sm font-semibold">
          <CardTitle>My Mentor</CardTitle>
          <ButtonLink
            className="text-primary text-sm bg-transparent hover:bg-transparent hover:underline"
            href=""
          >
            View All
          </ButtonLink>
        </CardHeader>
        <div className="flex justify-between gap-3">
          <div className="flex flex-col justify-center items-center">
            <Image src={"/assets/Images/mentor-1.png"} alt="" width={70} height={70} />
            <h6 className="text-sm font-semibold mt-3">Dr Ahmed</h6>
            <p className="text-xs mt-0.5">Hifiz</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <Image src={"/assets/Images/mentor-1.png"} alt="" width={70} height={70} />
            <h6 className="text-sm font-semibold mt-3">Dr Ahmed</h6>
            <p className="text-xs mt-0.5">Hifiz</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <Image src={"/assets/Images/mentor-1.png"} alt="" width={70} height={70} />
            <h6 className="text-sm font-semibold mt-3">Dr Ahmed</h6>
            <p className="text-xs mt-0.5">Hifiz</p>
          </div>
        </div>
      </Card>
      {/* Goal */}
      <Card className="my-4">
        <CardTitle className="text-sm font-semibold">Daily Goal</CardTitle>
        <CardContent className="">
          <h6
            aria-label="70 percent"
            className="text-2xl flex justify-center items-center text-slate-900 my-4 mx-auto font-bold h-32 w-32 border-[6px] border-primary rounded-full"
          >
            70%
          </h6>
          <p className="text-center">
            You&apos;ve completed{" "}
            <span className="text-primary" aria-label="thirty-five mins">
              {" "}
              35 mins
            </span>{" "}
            of your 50 min goal.
          </p>
          <Button
            type="button"
            className="block w-full h-12 mt-3 text-sm font-semibold bg-transparent border border-primary text-primary hover:bg-slate-200"
          >
            Resume Reading
          </Button>
        </CardContent>
      </Card>
      {/* Spiritual insights */}
      <Card>
        <CardTitle className="text-2xl font-semibold">Spiritual Insights</CardTitle>
        <ul className="my-3">
          <li className="flex items-center gap-2 my-4">
            <span className="bg-pink-200 p-2 rounded-lg">
              <GoLightBulb className="text-[#755B00]" size={24} />
            </span>
            <div>
              <h6 className="text-sm font-bold">Daily Reflection</h6>
              <p className="text-xs">"Verily, with every hardship comes ease..."</p>
            </div>
          </li>
          <li className="flex items-center gap-2 my-4">
            <span className="bg-green-200 p-2 rounded-lg">
              <Calendar className="text-primary" size={24} />
            </span>
            <div>
              <h6 className="text-sm font-bold">Community Webinar</h6>
              <p className="text-xs">Live session with Sheikh Yasin this Friday at 6PM.</p>
            </div>
          </li>
        </ul>
      </Card>
    </section>
  );
}
