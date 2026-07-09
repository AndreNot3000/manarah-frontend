"use client";

import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Progress } from "@/components/ui/progress";
import { IoTrophy } from "react-icons/io5";
import { PiSealCheckFill } from "react-icons/pi";
import { GoLightBulb } from "react-icons/go";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, listCompetitions, getSavedTutors, getOwnCertificates } from "@/lib/api";

function DailyGoalTracker() {
  const [minutes, setMinutes] = useState(35);
  const totalGoal = 50;

  useEffect(() => {
    const saved = localStorage.getItem("manarah_daily_reading_mins");
    if (saved) {
      setMinutes(parseInt(saved, 10));
    }
  }, []);

  function incrementProgress() {
    setMinutes((prev) => {
      const next = Math.min(totalGoal, prev + 5);
      localStorage.setItem("manarah_daily_reading_mins", String(next));
      return next;
    });
  }

  function resetProgress() {
    setMinutes(0);
    localStorage.setItem("manarah_daily_reading_mins", "0");
  }

  const percent = Math.min(100, Math.round((minutes / totalGoal) * 100));

  return (
    <CardContent className="flex flex-col items-center pt-2">
      <div className="relative h-32 w-32 flex items-center justify-center">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-slate-100"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className="text-primary transition-all duration-300"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - minutes / totalGoal)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
        </svg>
        <span className="text-2xl font-black text-slate-800">{percent}%</span>
      </div>

      <p className="text-xs text-slate-600 mt-6 text-center leading-relaxed">
        You&apos;ve completed <span className="text-primary font-bold">{minutes} mins</span> of your {totalGoal} min goal.
      </p>
      
      <div className="flex gap-2 w-full mt-4">
        <Button
          onClick={incrementProgress}
          disabled={minutes >= totalGoal}
          type="button"
          className="flex-1 h-11 text-xs font-semibold bg-transparent border border-primary text-primary hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
        >
          {minutes >= totalGoal ? "Goal Reached!" : "Read +5 Min"}
        </Button>
        {minutes > 0 && (
          <Button
            onClick={resetProgress}
            type="button"
            variant="outline"
            className="px-3 h-11 text-slate-400 hover:text-red-500 rounded-xl border-slate-200"
            title="Reset Daily progress"
          >
            Reset
          </Button>
        )}
      </div>
    </CardContent>
  );
}

export default function StudentDashboard() {
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
  });

  // Fetch active competition (the latest open competition)
  const { data: competitionsData } = useQuery({
    queryKey: ["activeCompetitions"],
    queryFn: () => listCompetitions({ status: "OPEN", limit: 1 }),
  });

  // Fetch saved tutors as mentors
  const { data: tutorsData } = useQuery({
    queryKey: ["savedTutors"],
    queryFn: getSavedTutors,
  });

  // Fetch student certificates
  const { data: certificatesData } = useQuery({
    queryKey: ["certificates"],
    queryFn: getOwnCertificates,
  });

  const isLoading = isUserLoading;

  // Fetch daily verse based on day of year
  const [dailyVerse, setDailyVerse] = useState<{ text: string; surah: string; number: number } | null>(null);
  const [isVerseLoading, setIsVerseLoading] = useState(false);

  useEffect(() => {
    async function fetchDailyVerse() {
      // Calculate day of the year to get a stable daily index
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const cacheKey = `manarah_verse_day_${dayOfYear}`;
      
      // Check cache first
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setDailyVerse(JSON.parse(cached));
            return;
          } catch {
            // fallback if json invalid
          }
        }
      }

      setIsVerseLoading(true);
      try {
        // Select an Ayah index offsetted by day of the year (1 - 6236)
        // Verse index 286 is Surah 2:286 ("Allah does not burden a soul...")
        const ayahNumber = ((dayOfYear * 7) % 6236) || 286; 

        // Fetch Arabic text
        const arRes = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}`);
        const arData = await arRes.json();
        
        // Fetch English translation (en.pickthall edition)
        const enRes = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/en.pickthall`);
        const enData = await enRes.json();

        if (arData?.code === 200 && enData?.code === 200) {
          const verseObject = {
            text: enData.data.text,
            surah: `${enData.data.surah.englishName} ${enData.data.surah.number}:${enData.data.numberInSurah}`,
            number: ayahNumber
          };
          setDailyVerse(verseObject);
          if (typeof window !== "undefined") {
            // Clear other days verses to clean up localstorage
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith("manarah_verse_day_")) {
                localStorage.removeItem(k);
              }
            }
            localStorage.setItem(cacheKey, JSON.stringify(verseObject));
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily verse:", err);
      } finally {
        setIsVerseLoading(false);
      }
    }
    fetchDailyVerse();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
            <div className="absolute h-14 w-14 rounded-full border-4 border-slate-100 border-b-emerald-400 animate-spin-reverse" />
            <div className="absolute h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shadow-sm">
              <span className="text-emerald-700 font-extrabold text-xs">M</span>
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-slate-800 font-semibold text-base font-outfit tracking-wide animate-pulse">
              Loading dashboard...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const name = userData?.profile?.name || "Student";

  // Active competition processing
  const activeComp = competitionsData?.competitions?.[0];
  const activeCompDaysLeft = activeComp
    ? Math.max(0, Math.ceil((new Date(activeComp.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Mentors list (saved tutors)
  const savedMentors = tutorsData?.tutors || [];

  // Certificates list
  const earnedCertificates = certificatesData?.certificates || [];
  const certCount = earnedCertificates.length;
  const nextMilestone = certCount <= 5 ? 5 : certCount <= 10 ? 10 : Math.ceil((certCount + 1) / 5) * 5;
  const certProgressPercent = nextMilestone > 0 ? (certCount / nextMilestone) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Assalamu Alaikum, {name}</h2>
          <p className="text-sm text-neutral-muted mt-0.5">Your journey of illumination continues today.</p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200/50 px-3 py-1.5 rounded-xl self-start md:self-auto flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Active Session
        </div>
      </div>

      {/* Grid Layout Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column Area (takes 2 columns of 3 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Competition Card */}
          {activeComp ? (
            <Card className="relative overflow-hidden border border-emerald-100 bg-gradient-to-br from-white to-green-50/20">
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-bold border-none text-[10px] rounded-md px-2 py-0.5 uppercase tracking-wider">
                      Active Competition
                    </Badge>
                    <CardTitle className="text-xl font-bold text-slate-800 mt-2">
                      {activeComp.title}
                    </CardTitle>
                  </div>
                  <span className="bg-[#FFDF90] p-2.5 rounded-xl text-amber-800 shadow-sm shrink-0">
                    <IoTrophy size={20} />
                  </span>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-slate-100 pt-5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Time remaining to submit</span>
                    <div className="flex items-center gap-3 mt-2 text-primary font-black text-xl">
                      <div className="text-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm min-w-[50px]">
                        <span className="block leading-none text-base">{String(activeCompDaysLeft).padStart(2, "0")}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Days</span>
                      </div>
                    </div>
                  </div>

                  <ButtonLink
                    className="text-white px-6 text-sm font-semibold rounded-xl h-11 flex items-center justify-center shrink-0"
                    href={`/competitions/${activeComp.id}`}
                  >
                    Join Now
                  </ButtonLink>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="relative overflow-hidden border border-slate-100 p-6 text-center">
              <span className="p-3 bg-slate-100 rounded-full inline-block text-slate-400 mb-2">
                <IoTrophy size={24} />
              </span>
              <CardTitle className="text-sm font-bold text-slate-700">No Active Competitions</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Check back later for upcoming Islamic competitions.</p>
            </Card>
          )}

          {/* Mentors Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between text-sm font-semibold pb-4">
              <CardTitle className="text-base font-bold text-slate-800">My Mentors</CardTitle>
              <ButtonLink
                className="text-primary text-xs bg-transparent hover:bg-transparent hover:underline px-0 font-bold"
                href="/student-dashboard/saved-tutors"
              >
                View Saved Tutors
              </ButtonLink>
            </CardHeader>
            <CardContent>
              {savedMentors.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  You haven&apos;t saved any tutors yet.
                  <Link href="/tutors" className="text-primary font-bold hover:underline block mt-1">Explore Tutors →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {savedMentors.slice(0, 3).map((mentor) => (
                    <div key={mentor.tutorId} className="flex flex-col items-center p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-green-200 shadow-sm flex items-center justify-center bg-green-50 text-primary font-bold text-sm">
                        {mentor.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mentor.photoUrl} alt={mentor.name} className="h-full w-full object-cover" />
                        ) : (
                          mentor.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-2.5 truncate w-full text-center">{mentor.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate w-full text-center">
                        {mentor.subjects[0]?.replace("_", " ") || "Quran"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spiritual Insights */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Spiritual Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-pink-50/10">
                <span className="bg-pink-100 p-2.5 rounded-xl text-pink-700 shrink-0">
                  <GoLightBulb size={18} />
                </span>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800">Daily Reflection</h5>
                  {isVerseLoading ? (
                    <p className="text-xs text-slate-400 italic animate-pulse">Loading reflection...</p>
                  ) : dailyVerse ? (
                    <>
                      <p className="text-xs text-slate-600 leading-relaxed italic">&quot;{dailyVerse.text}&quot;</p>
                      <span className="text-[9px] text-slate-400 font-bold block pt-1">{dailyVerse.surah}</span>
                    </>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed italic">&quot;Verily, with every hardship comes ease...&quot;</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-green-50/10">
                <span className="bg-green-100 p-2.5 rounded-xl text-primary shrink-0">
                  <Calendar size={18} className="text-primary" />
                </span>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800">Community Webinar</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">Live Q&A session with Sheikh Yasin this Friday at 6:00 PM.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Column Area (takes 1 column of 3 on desktop) */}
        <div className="space-y-6">
          
          {/* Daily Goal Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-800">Daily Goal</CardTitle>
            </CardHeader>
            <DailyGoalTracker />
          </Card>

          {/* Certificates Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Certificates</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <span className="p-3 bg-slate-100 rounded-2xl text-slate-700 shadow-sm mb-3">
                <PiSealCheckFill size={28} />
              </span>
              <span className="text-2xl font-black text-slate-800">{certCount}</span>
              <p className="text-xs text-slate-600 mt-1 font-medium">Earned Certificates</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Next Milestone</span>
                  <span>{certCount}/{nextMilestone}</span>
                </div>
                <Progress value={certProgressPercent} className="h-2 w-full rounded-full bg-slate-100" />
                <p className="text-[10px] text-slate-400 font-semibold text-center mt-1">
                  Earn {nextMilestone - certCount} more to unlock next certificate badge
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
