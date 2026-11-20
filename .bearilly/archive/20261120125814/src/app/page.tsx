"use client";

import {
  Badge,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleTutorSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/tutors?q=${encodeURIComponent(q)}` : "/tutors");
  }

  return (
    <div className="space-y-section">
      {/* Hero */}
      <section className="flex flex-col gap-5 rounded-card bg-gradient-to-br from-[#eaf6f0] to-white dark:from-[#061810] dark:to-[#0b0f17] border border-slate-100 dark:border-emerald-900/20 p-6 md:p-10 lg:flex-row shadow-card">
        <div>
          <Badge variant="secondary" className="mb-4">
            <span className="w-1.5 h-1.5 mr-1 bg-secondary rounded-full"></span>
            Islamic Learning Platform
          </Badge>
          <h1 className="max-w-xl text-slate-900 dark:text-slate-100">Learn · Teach · Compete</h1>
          <p className="mt-3 max-w-lg text-body text-neutral-muted dark:text-slate-300">
            Connect with qualified tutors, join Islamic competitions, and grow your knowledge — all
            in one place.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink className="gap-1" href="/register" size="lg">
              Get Started
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/courses" variant="outline" size="lg">
              Explore Courses
            </ButtonLink>
          </div>
          <div className="flex gap-6 mt-12 pt-5 border-t">
            <div>
              <h3 className="font-semibold text-base">500+</h3>
              <p className="text-xs font-medium">QUALIFIED TUTORS</p>
            </div>
            <div>
              <h3 className="font-semibold text-base">10k+</h3>
              <p className="text-xs font-medium">ACTIVE STUDENTS</p>
            </div>
          </div>
        </div>
        {/* Hero Image */}
        <div className="mt-12 relative md:mt-0">
          <div className="relative overflow-visible">
            <Image
              src="/assets/images/Hero.png"
              alt="A young muslim lady on hijab"
              width={600}
              height={500}
              className="w-full rounded-xl object-cover"
            />
            <Card className="absolute bottom-6 left-6 flex items-center gap-4 rounded-xl px-4 py-3 shadow-lg">
              <span className="inline-block bg-secondary p-2 rounded-full">
                <BadgeCheck className="text-[#765C00]" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Certified Tutors</h3>
                <p className="text-xs font-medium">Verified by Manarah</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Tutor Marketplace</CardTitle>
              <Badge variant="verified">Verified</Badge>
            </div>
            <CardDescription>Find tutors for Quran, Tajweed, Hifz, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTutorSearch}>
              <label className="mb-1.5 block text-caption font-medium text-neutral-text dark:text-slate-300">
                Search tutors
              </label>
              <Input
                placeholder="e.g. Tajweed, Arabic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </CardContent>
          <CardFooter>
            <ButtonLink href="/tutors">Explore Tutors</ButtonLink>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Competition Hub</CardTitle>
              <Badge variant="premium">Open</Badge>
            </div>
            <CardDescription>
              Register for Quran recitation, Hifz, and quiz competitions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Join competitions, upload documents, and earn certificates.</p>
          </CardContent>
          <CardFooter className="gap-2">
            <ButtonLink href="/competitions">View All</ButtonLink>
            <ButtonLink href="/competitions" variant="ghost">
              Learn More
            </ButtonLink>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
