"use client";
import { Button, ButtonLink, Input } from "@/components/ui";
import BookCard from "@/components/ui/bookCard";
import CourseCard from "@/components/ui/courseCard";
import EnrolledCourseCard from "@/components/ui/enrolledCourseCard";
import FeaturedProgramCard from "@/components/ui/featuredProgramCard";
import ReadBookCard from "@/components/ui/readBookCard";
import { ArrowRight, ChevronDown, Search } from "lucide-react";

export default function Page() {
  return (
    <div>
      <div className="text-center mt-6 pb-8">
        <h1 className="font-semibold text-xl lg:text-3xl">Learn. Grow. Excel.</h1>
        <p className="text-base w-[336px] mx-auto mt-3 md:w-[672px] lg:text-[1.125rem]">
          Explore courses and books designed to deepen your Islamic knowledge and support your
          lifelong spiritual journey.
        </p>
      </div>
      <section className="md:flex gap-2 items-center">
        <form className="relative flex-1">
          <Input
            className="block w-full rounded-full text-[#3F493F] pl-10 text-sm"
            type="text"
            placeholder="Search courses, topics, or authors..."
          />
          <Search className="absolute top-3 left-3" size={24} />
        </form>
        <div className="bg-[#EDEEEF] rounded-full mt-3 flex flex-1 md:mt-0">
          <Button className="w-full rounded-full text-white text-sm">All Resources</Button>
          <Button variant="ghost" className="w-full rounded-full text-sm">
            Courses
          </Button>
          <Button variant="ghost" className="w-full rounded-full text-sm">
            Books
          </Button>
        </div>
      </section>

      <section className="my-12">
        <h2 className="text-base font-semibold flex items-center gap-2 lg:text-lg">
          <span className="w-1 h-6 bg-[#755B00] inline-block rounded-t-lg rounded-b-lg"></span>
          Featured Program
        </h2>
        <FeaturedProgramCard
          imagePath="/assets/images/featured-course.png"
          title="Qur'an Recitation & Tajweed"
          description="Master the precise rules of Tajweed and beautify your recitation with comprehensive guided
          lessons.…"
          tutor="Sheikh Yasin"
          level="Beginner"
          duration={4.3}
          numberOfLessons={12}
          href=""
        />
      </section>
      {/* Course */}
      <section className="my-12">
        <div className="flex items-center justify-between text-base mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2 lg:text-lg">
            <span className="w-1 h-6 bg-green-950 inline-block rounded-t-lg rounded-b-lg"></span>
            Your Courses
          </h2>
          <ButtonLink href="" variant="ghost" className="gap-1 text-primary hover:bg-none">
            Explore Curriculum
            <ArrowRight />
          </ButtonLink>
        </div>
        <div className="md:grid grid-cols-2 gap-5">
          <EnrolledCourseCard
            imagePath="/assets/images/course.jpg"
            title="Qur'an Recitation & Tajweed"
            description="Master the rules of Tajweed and improve your recitation with comprehensive guided…
"
            href="/"
            progress={65}
            cta="Continue Learning"
          />
          {/* courses */}
          <CourseCard
            imagePath="/assets/images/course.jpg"
            title="Islamic Fiqh Basics"
            description="An introduction to Islamic jurisprudence,
covering the foundational principles of daily…"
            duration={8}
            cta="Start Course"
          />
          <CourseCard
            imagePath="/assets/images/course.jpg"
            title="Seerah of the Prophet"
            description="Explore the life and legacy of Prophet
Muhammad (PBUH) in this detailed historical…"
            duration={15}
            cta="Start Course"
          />
        </div>
      </section>
      {/* Digital Library */}
      <section className="my-12">
        <div className="flex items-center justify-between text-base">
          <h2 className="text-base font-semibold flex items-center gap-2 lg:text-lg">
            <span className="w-1 h-6 bg-green-950 inline-block rounded-t-lg rounded-b-lg"></span>
            Digital Library
          </h2>
          <ButtonLink href="" variant="ghost" className="gap-1 text-primary hover:bg-none">
            Browse Library
            <ArrowRight />
          </ButtonLink>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReadBookCard
            imagePath="/assets/images/book-1.png"
            title="Intro to Islamic…"
            author="Ahmed Yusuf"
            progress={30}
          />
          <BookCard
            imagePath="/assets/images/book-1.png"
            title="The Daily Adhkar"
            author="Imam Al-Nawawi"
          />
          <BookCard
            imagePath="/assets/images/book-1.png"
            title="Purification of the…"
            author="Hamza Yusuf"
          />
          <BookCard
            imagePath="/assets/images/book-1.png"
            title="Stories of the…"
            author="Ibn Kathir"
          />
        </div>
      </section>
      <div className="mx-auto">
        <Button
          variant="ghost"
          className="bg-[#E1E3E4] h-auto w-auto mx-auto px-3 py-1 font-normal text-sm flex items-center gap-1 rounded-xl"
        >
          Load More
          <ChevronDown aria-hidden="true" size={14} />
        </Button>
      </div>
    </div>
  );
}
