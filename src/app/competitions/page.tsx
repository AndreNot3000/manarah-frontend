"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCompetitions } from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge } from "@/components/ui";
import { Trophy, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const TYPE_CHIPS = [
  { id: "ALL", label: "All Categories", value: undefined },
  { id: "QURAN_RECITATION", label: "Quran Recitation", value: "QURAN_RECITATION" },
  { id: "HIFZ", label: "Hifz", value: "HIFZ" },
  { id: "ISLAMIC_QUIZ", label: "Islamic Quiz", value: "ISLAMIC_QUIZ" },
  { id: "ARABIC_COMPETITION", label: "Arabic Language", value: "ARABIC_COMPETITION" },
  { id: "ESSAY_COMPETITION", label: "Essay Writing", value: "ESSAY_COMPETITION" },
];

const STATUS_CHIPS = [
  { id: "ALL_STATUS", label: "All Statuses", value: undefined },
  { id: "OPEN", label: "Open Registrations", value: "OPEN" },
  { id: "CLOSED", label: "Closed", value: "CLOSED" },
  { id: "RESULTS_PUBLISHED", label: "Results Live", value: "RESULTS_PUBLISHED" },
];

export default function CompetitionsDirectory() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Query competitions list
  const { data, isLoading } = useQuery({
    queryKey: ["publicCompetitions", selectedType, selectedStatus, page],
    queryFn: () => listCompetitions({ type: selectedType, status: selectedStatus, page, limit }),
  });

  const competitions = data?.competitions || [];
  const meta = data?.meta || { page: 1, limit: 12, total: 0 };
  const totalPages = Math.ceil(meta.total / limit) || 1;

  function handleTypeChange(val: string | undefined) {
    setSelectedType(val);
    setPage(1);
  }

  function handleStatusChange(val: string | undefined) {
    setSelectedStatus(val);
    setPage(1);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-bold text-[10px] rounded-md py-0.5 px-2">OPEN</Badge>;
      case "CLOSED":
        return <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 font-bold text-[10px] rounded-md py-0.5 px-2">CLOSED</Badge>;
      case "RESULTS_PUBLISHED":
        return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-50 font-bold text-[10px] rounded-md py-0.5 px-2">RESULTS LIVE</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold text-[10px] rounded-md py-0.5 px-2">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50/40 p-6 md:p-8 rounded-2xl border border-green-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Competition Hub</h1>
          <p className="text-sm text-slate-600 font-medium">
            Join reciting, memorization, and Islamic knowledge tests. Compete and earn recognized certificate awards.
          </p>
        </div>
        <span className="p-4 bg-emerald-100/50 rounded-full text-emerald-800 self-start sm:self-auto shrink-0 shadow-inner">
          <Trophy size={36} />
        </span>
      </section>

      {/* Filter controls */}
      <div className="space-y-4">
        {/* Category type Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TYPE_CHIPS.map((chip) => {
            const isSelected = selectedType === chip.value;
            return (
              <button
                key={chip.id}
                onClick={() => handleTypeChange(chip.value)}
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
        </div>

        {/* Status Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
          {STATUS_CHIPS.map((chip) => {
            const isSelected = selectedStatus === chip.value;
            return (
              <button
                key={chip.id}
                onClick={() => handleStatusChange(chip.value)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap mb-2",
                  isSelected
                    ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Competitions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[280px] animate-pulse bg-slate-100/50 border-slate-200" />
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Trophy size={36} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Competitions Found</CardTitle>
          <CardDescription className="max-w-xs mt-2 mx-auto">
            We couldn&apos;t find any competitions matching your selected filter options.
          </CardDescription>
          <Button
            onClick={() => {
              setSelectedType(undefined);
              setSelectedStatus(undefined);
              setPage(1);
            }}
            variant="outline"
            className="mt-5 rounded-xl text-xs font-semibold"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          {competitions.map((comp) => {
            const dateStr = new Date(comp.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Card key={comp.id} className="flex flex-col hover:shadow-md transition-all duration-200">
                <div className="p-5 space-y-4 flex-1">
                  
                  {/* Category and status badge */}
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    <Badge className="bg-green-50 text-primary hover:bg-green-50 font-bold border-none text-[9px] rounded-md px-2 py-0.5 uppercase tracking-wider">
                      {comp.category}
                    </Badge>
                    {getStatusBadge(comp.status)}
                  </div>

                  {/* Title and details */}
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 leading-snug">
                      {comp.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>

                  {/* Date and Fee metadata grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-500 font-bold border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="text-slate-400 font-bold text-[11px] leading-none w-3.5 text-center">₦</span>
                      Fee: {parseFloat(comp.fee) === 0 ? "Free" : comp.fee}
                    </span>
                  </div>

                </div>

                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center rounded-b-xl">
                  <Link href={`/competitions/${comp.id}`} className="w-full">
                    <Button className="w-full text-xs font-bold h-9 rounded-lg">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
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
