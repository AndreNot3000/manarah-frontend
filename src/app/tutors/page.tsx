"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listTutors } from "@/lib/api";
import { Card, CardTitle, CardDescription, Input, Button, Badge } from "@/components/ui";
import { Search, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const SUBJECT_CHIPS = [
  { id: "ALL", label: "All Subjects", value: undefined },
  { id: "QURAN", label: "Quran", value: "QURAN" },
  { id: "TAJWEED", label: "Tajweed", value: "TAJWEED" },
  { id: "HIFZ", label: "Hifz", value: "HIFZ" },
  { id: "ARABIC", label: "Arabic", value: "ARABIC" },
  { id: "ISLAMIC_STUDIES", label: "Islamic Studies", value: "ISLAMIC_STUDIES" },
];

export default function TutorsDirectory() {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [searchVal, setSearchVal] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Query tutors list
  const { data, isLoading } = useQuery({
    queryKey: ["publicTutors", selectedSubject, q, page],
    queryFn: () => listTutors({ subject: selectedSubject, q, page, limit }),
  });

  const tutors = data?.tutors || [];
  const meta = data?.meta || { page: 1, limit: 12, total: 0 };
  const totalPages = Math.ceil(meta.total / limit) || 1;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchVal);
    setPage(1);
  }

  function handleSubjectChange(value: string | undefined) {
    setSelectedSubject(value);
    setPage(1);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      {/* Search Header Banner */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50/40 p-6 md:p-8 rounded-2xl border border-green-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tutor Marketplace</h1>
          <p className="text-sm text-slate-600 font-medium">
            Learn from qualified, verified, and premium Islamic scholars and educators around the globe.
          </p>
        </div>
        
        {/* Search input Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md shrink-0">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by name or bio..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="h-12 pl-10 border-2 bg-white rounded-xl text-sm"
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          </div>
          <Button type="submit" className="h-12 px-6 rounded-xl font-bold text-sm">
            Search
          </Button>
        </form>
      </section>

      {/* Horizontal subject chips */}
      <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECT_CHIPS.map((chip) => {
          const isSelected = selectedSubject === chip.value;
          return (
            <button
              key={chip.id}
              onClick={() => handleSubjectChange(chip.value)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap",
                isSelected
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </section>

      {/* Tutors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[280px] animate-pulse bg-slate-100/50 border-slate-200" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <GraduationCap size={36} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Tutors Found</CardTitle>
          <CardDescription className="max-w-xs mt-2 mx-auto">
            We couldn&apos;t find any tutors matching your filters or search keywords. Try adjusting your query.
          </CardDescription>
          <Button
            onClick={() => {
              setSearchVal("");
              setQ("");
              setSelectedSubject(undefined);
              setPage(1);
            }}
            variant="outline"
            className="mt-5 rounded-xl text-xs font-semibold"
          >
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="flex flex-col hover:shadow-md transition-all duration-200">
              <div className="p-5 space-y-4 flex-1">
                {/* Header layout */}
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center font-bold text-primary text-xl overflow-hidden shrink-0">
                    {tutor.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tutor.photoUrl} alt={tutor.name} className="h-full w-full object-cover" />
                    ) : (
                      tutor.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate text-base leading-snug">{tutor.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      {tutor.status === "PREMIUM" && (
                        <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] rounded-md py-0 px-1.5 uppercase tracking-wider">
                          Premium
                        </Badge>
                      )}
                      {tutor.status === "VERIFIED" && (
                        <Badge className="bg-green-100 text-primary border-none font-bold text-[9px] rounded-md py-0 px-1.5 uppercase tracking-wider">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio description */}
                {tutor.bio ? (
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {tutor.bio}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No bio description available.</p>
                )}

                {/* Subject tags */}
                <div className="flex gap-1.5 flex-wrap">
                  {tutor.subjects.map((sub) => (
                    <Badge
                      key={sub}
                      className="text-[10px] border border-slate-200 text-slate-600 bg-slate-50 font-medium px-2 py-0.5 rounded-lg"
                    >
                      {sub.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Card Footer pricing & details */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center rounded-b-xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Hourly rate</span>
                  <span className="text-sm font-black text-slate-700">
                    {tutor.pricing ? `₦${tutor.pricing}/hr` : "Rates on request"}
                  </span>
                </div>
                
                <Link href={`/tutors/${tutor.id}`}>
                  <Button size="sm" className="font-bold text-xs rounded-lg px-4 h-9">
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <section className="flex items-center justify-center gap-4 pt-6">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            className="rounded-xl h-10 px-4 flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="text-xs font-semibold text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            className="rounded-xl h-10 px-4 flex items-center gap-1 text-xs font-semibold"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </section>
      )}
    </div>
  );
}
