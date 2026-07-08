"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSavedTutors, unsaveTutor } from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge, ListGridSkeleton } from "@/components/ui";
import { Trash2, ExternalLink, Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SavedTutorsPage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch saved tutors
  const { data, isLoading } = useQuery({
    queryKey: ["savedTutors"],
    queryFn: getSavedTutors,
  });

  // Unsave tutor mutation
  const unsaveMutation = useMutation({
    mutationFn: (tutorId: string) => unsaveTutor(tutorId),
    onSuccess: () => {
      // Invalidate query to trigger refresh
      queryClient.invalidateQueries({ queryKey: ["savedTutors"] });
      setSuccessMessage("Tutor removed from your saved list.");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const tutors = data?.tutors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Saved Tutors</h1>
        <p className="text-sm text-neutral-muted mt-1">
          Quickly access and message your bookmarked tutors for lessons.
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-green-600" />
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <ListGridSkeleton count={4} />
      ) : tutors.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Bookmark size={32} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Saved Tutors</CardTitle>
          <CardDescription className="max-w-sm mt-2">
            You haven&apos;t saved any tutors yet. Browse the marketplace to find the perfect tutor for your learning needs.
          </CardDescription>
          <Link href="/tutors" className="mt-5">
            <Button className="font-semibold text-sm rounded-xl px-5 h-11">
              Find Tutors
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((saved) => (
            <Card key={saved.tutorId} className="flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 flex gap-4 flex-1">
                {/* Tutor Avatar */}
                <div className="h-16 w-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center font-bold text-primary text-xl overflow-hidden shrink-0">
                  {saved.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={saved.photoUrl} alt={saved.name} className="h-full w-full object-cover" />
                  ) : (
                    saved.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 truncate text-base">{saved.name}</h3>
                    {saved.status !== "PENDING" && (
                      <Badge className="bg-green-100 text-primary border-none hover:bg-green-100 font-bold text-[10px] rounded-md py-0.5 px-1.5">
                        {saved.status}
                      </Badge>
                    )}
                  </div>

                  {/* Subject tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {saved.subjects.map((sub) => (
                      <Badge key={sub} className="text-xs border border-slate-200 text-slate-600 bg-slate-50 font-medium">
                        {sub}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm font-bold text-slate-700">
                    {saved.pricing ? `$${saved.pricing}/hr` : "Rates on request"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex gap-3 justify-end">
                <Button
                  onClick={() => unsaveMutation.mutate(saved.tutorId)}
                  disabled={unsaveMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg h-9"
                >
                  <Trash2 size={14} />
                  Remove
                </Button>
                <Link href={`/tutors/${saved.tutorId}`}>
                  <Button size="sm" className="gap-1.5 text-xs rounded-lg h-9">
                    <ExternalLink size={14} />
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
