"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, verifyTutor, getTutor } from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge } from "@/components/ui";
import { UserCheck, AlertCircle, FileText, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

export default function AdminTutorsQueue() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected tutor for detailed verification modal
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);

  // Fetch tutor list
  const { data: usersData, isLoading: isListLoading } = useQuery({
    queryKey: ["adminTutors", page],
    queryFn: () => getAdminUsers({ role: "TUTOR", page, limit }),
  });

  // Fetch full details of selected tutor for review
  const { data: tutorDetailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["adminTutorDetail", selectedTutorId],
    queryFn: () => getTutor(selectedTutorId!),
    enabled: !!selectedTutorId,
  });

  // Verify Tutor Mutation
  const verifyMutation = useMutation({
    mutationFn: (data: { id: string; status: "VERIFIED" | "REJECTED" }) =>
      verifyTutor(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTutors"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setSelectedTutorId(null);
    },
  });

  if (isListLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading tutor queue...
        </div>
      </div>
    );
  }

  const tutors = usersData?.users || [];
  const meta = usersData?.meta || { page: 1, limit: 10, total: 0 };
  const totalPages = Math.ceil(meta.total / limit) || 1;

  const reviewTutor = tutorDetailData?.tutor;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Tutor Verification</h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          Verify qualifications and activate pending tutor listings to make them searchable.
        </p>
      </div>

      {/* Main Table/List */}
      {tutors.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <UserCheck size={32} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">Queue is Empty</CardTitle>
          <CardDescription className="max-w-xs mt-2 mx-auto">
            No tutor applications match search criteria or require approval currently.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <Card className="hidden md:block overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {tutors.map((tutor) => (
                    <tr key={tutor.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-green-100 text-primary flex items-center justify-center font-bold text-[10px] uppercase">
                          {tutor.name.charAt(0)}
                        </span>
                        {tutor.name}
                      </td>
                      <td className="p-4 font-normal text-slate-500">{tutor.email}</td>
                      <td className="p-4">
                        {tutor.status === "PENDING" && (
                          <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                            PENDING REVIEW
                          </Badge>
                        )}
                        {tutor.status === "VERIFIED" && (
                          <Badge className="bg-green-100 text-primary border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                            VERIFIED
                          </Badge>
                        )}
                        {tutor.status === "PREMIUM" && (
                          <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                            PREMIUM
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-normal">
                        {new Date(tutor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTutorId(tutor.id)}
                          className="rounded-lg text-xs font-bold h-8 px-3"
                        >
                          Review App
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card List View */}
          <div className="space-y-4 md:hidden">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="p-4 border border-slate-200 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="h-8 w-8 rounded-full bg-green-100 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {tutor.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{tutor.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">{tutor.email}</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    {tutor.status === "PENDING" && (
                      <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        PENDING
                      </Badge>
                    )}
                    {tutor.status === "VERIFIED" && (
                      <Badge className="bg-green-100 text-primary border-none font-bold text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        VERIFIED
                      </Badge>
                    )}
                    {tutor.status === "PREMIUM" && (
                      <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
                  <span>Registered: {new Date(tutor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTutorId(tutor.id)}
                    className="rounded-lg text-[10px] font-bold h-7 px-2.5"
                  >
                    Review App
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
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
            </div>
          )}
        </div>
      )}

      {/* Review Details Overlay Modal */}
      {selectedTutorId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Review Tutor Credentials</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Analyze verification details and qualifications for certificate approval.
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedTutorId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {isDetailLoading ? (
              <div className="text-center py-10 text-xs font-semibold text-primary animate-pulse">
                Fetching qualifications...
              </div>
            ) : !reviewTutor ? (
              <div className="text-center py-10 text-xs text-red-500 font-semibold">
                Failed to fetch details.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                
                {/* Meta details */}
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center font-bold text-primary text-xl overflow-hidden shrink-0">
                    {reviewTutor.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={reviewTutor.photoUrl} alt={reviewTutor.name} className="h-full w-full object-cover" />
                    ) : (
                      reviewTutor.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{reviewTutor.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Hourly pricing: ₦{reviewTutor.pricing || "Rates on request"}/hr</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Biography</span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
                    {reviewTutor.bio || "No biography provided."}
                  </p>
                </div>

                {/* Specialized subjects */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjects</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {reviewTutor.subjects.map((sub) => (
                      <Badge key={sub} className="text-[10px] border border-slate-200 text-slate-600 bg-slate-50 font-bold px-2 py-0.5 rounded-lg">
                        {sub.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Availability schedule</span>
                  <span className="text-xs font-semibold text-slate-600">{reviewTutor.availability || "Not configured"}</span>
                </div>

                {/* Qualifications List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qualifications Attachments</span>
                  {reviewTutor.qualifications && reviewTutor.qualifications.length > 0 ? (
                    reviewTutor.qualifications.map((q) => (
                      <div key={q.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <span className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          {q.title}
                        </span>
                        <a
                          href={q.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          View Document
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                      <AlertCircle size={16} />
                      Warning: No qualifications documents have been uploaded by this tutor.
                    </div>
                  )}
                </div>

                {/* Verification Decisions CTA */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => verifyMutation.mutate({ id: reviewTutor.id, status: "REJECTED" })}
                    disabled={verifyMutation.isPending}
                    className="rounded-xl h-10 px-4 text-xs font-bold border-red-100 text-red-600 hover:bg-red-50 gap-1.5"
                  >
                    <XCircle size={14} />
                    Reject Application
                  </Button>
                  <Button
                    type="button"
                    onClick={() => verifyMutation.mutate({ id: reviewTutor.id, status: "VERIFIED" })}
                    disabled={verifyMutation.isPending}
                    className="rounded-xl h-10 px-5 text-xs font-bold bg-primary text-white gap-1.5"
                  >
                    <CheckCircle size={14} />
                    Approve & Verify
                  </Button>
                </div>

              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
}
