"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitionDetail, getCurrentUser, registerCompetition, uploadCompetitionDocuments, listCompetitionDocuments } from "@/lib/api";
import { Card, Button, Badge } from "@/components/ui";
import { ChevronLeft, Calendar, Trophy, FileText, CheckCircle2, UploadCloud } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const compId = resolvedParams.id;

  // State for Payment Upload simulation
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofName, setProofName] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  // State for Document Submission (FE-042)
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  // 1. Fetch competition details
  const { data: compData, isLoading: isCompLoading, error: compError } = useQuery({
    queryKey: ["competitionDetail", compId],
    queryFn: () => getCompetitionDetail(compId),
  });

  // 2. Fetch current user profile
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const isLoggedIn = !!profileData;
  const isStudent = profileData?.role === "STUDENT";

  // 3. Fetch uploaded documents if registered
  const isRegistered = !!compData?.competition?.userRegistration;
  const { data: docsData } = useQuery({
    queryKey: ["competitionDocs", compId],
    queryFn: () => listCompetitionDocuments(compId),
    enabled: isRegistered && isLoggedIn && isStudent,
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: () => registerCompetition(compId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitionDetail", compId] });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      setIsUploadingPayment(true);
      setPaymentError(null);
      
      const formData = new FormData();
      if (proofFile) {
        formData.append("documents", proofFile);
      }

      try {
        await uploadCompetitionDocuments(compId, formData);
        setPaymentSuccess(true);
      } catch (err: unknown) {
        const error = err as Error;
        setPaymentError(error.message || "Failed to upload payment proof. Please try again.");
      } finally {
        setIsUploadingPayment(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitionDetail", compId] });
      queryClient.invalidateQueries({ queryKey: ["competitionDocs", compId] });
    },
  });

  // Document upload mutation (FE-042)
  const docUploadMutation = useMutation({
    mutationFn: async () => {
      setIsUploadingDocs(true);
      setDocUploadError(null);

      const formData = new FormData();
      docFiles.forEach((file) => {
        formData.append("documents", file);
      });

      try {
        await uploadCompetitionDocuments(compId, formData);
        setDocUploadSuccess(true);
        setDocFiles([]);
        setTimeout(() => setDocUploadSuccess(false), 3000);
      } catch (err: unknown) {
        const error = err as Error;
        setDocUploadError(error.message || "Failed to upload files. Please try again.");
      } finally {
        setIsUploadingDocs(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitionDocs", compId] });
      queryClient.invalidateQueries({ queryKey: ["competitionDetail", compId] });
    },
  });

  if (isCompLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading competition...
        </div>
      </div>
    );
  }

  if (compError || !compData?.competition) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Competition Not Found</h2>
        <p className="text-sm text-slate-500">
          The competition you are looking for does not exist or has been removed.
        </p>
        <Link href="/competitions">
          <Button variant="outline" className="rounded-xl">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const comp = compData.competition;
  const userReg = comp.userRegistration;
  const isPendingPayment = userReg?.paymentStatus === "PENDING";
  const isConfirmedPayment = userReg?.paymentStatus === "CONFIRMED" || parseFloat(comp.fee) === 0;

  const dateStr = new Date(comp.deadline).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // File validations for document portal (FE-042)
  const ALLOWED_MIMES = new Set(["application/pdf", "image/jpeg", "image/png", "audio/mpeg", "video/mp4", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
  
  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    let hasInvalid = false;

    files.forEach((f) => {
      if (ALLOWED_MIMES.has(f.type) || f.name.endsWith(".docx") || f.name.endsWith(".mp3") || f.name.endsWith(".mp4")) {
        validFiles.push(f);
      } else {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      setDocUploadError("Only PDF, Word Doc, JPEG, PNG, MP3 audio, or MP4 video files are allowed.");
    } else {
      setDocUploadError(null);
    }

    setDocFiles((prev) => [...prev, ...validFiles]);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Back to list */}
      <div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to competitions
        </Link>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Badge className="bg-green-50 text-primary hover:bg-green-50 font-bold border-none text-[10px] rounded-md px-2 py-0.5 uppercase tracking-wider">
                {comp.category}
              </Badge>
              <h1 className="text-2xl font-black text-slate-800 leading-tight">{comp.title}</h1>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {comp.description}
            </p>
          </Card>

          {/* Results display leaderboard (FE-043) */}
          {comp.status === "RESULTS_PUBLISHED" && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                Competition Leaderboard & Results
              </h2>
              <div className="space-y-3">
                {!comp.winners || comp.winners.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    Leaderboard results are not configured.
                  </div>
                ) : (
                  comp.winners.map((winner) => {
                    const isGold = winner.placement === 1;
                    const isSilver = winner.placement === 2;
                    const isBronze = winner.placement === 3;
                    return (
                      <div
                        key={winner.userId}
                        className={clsx(
                          "flex justify-between items-center p-3 rounded-xl border font-semibold text-slate-700",
                          isGold ? "border-amber-200 bg-amber-50/20 text-slate-800 font-bold" : "border-slate-100 bg-slate-50/30"
                        )}
                      >
                        <span className="text-xs flex items-center gap-2">
                          <span
                            className={clsx(
                              "h-5 w-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold",
                              isGold ? "bg-amber-400" : isSilver ? "bg-slate-300" : isBronze ? "bg-orange-400" : "bg-slate-400"
                            )}
                          >
                            {winner.placement}
                          </span>
                          {winner.name} {isGold && "(Winner)"}
                        </span>
                        <Badge
                          className={clsx(
                            "border-none font-bold text-[9px] px-2 py-0.5 rounded-lg",
                            isGold ? "bg-amber-100 text-amber-800" : isSilver ? "bg-slate-100 text-slate-600" : isBronze ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {isGold ? "Gold Medal" : isSilver ? "Silver" : isBronze ? "Bronze" : `Placement #${winner.placement}`}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          )}

          {/* Document submissions uploader portal (FE-042) */}
          {isRegistered && isConfirmedPayment && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                Document Upload Portal
              </h2>

              {docUploadSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold mb-4">
                  <CheckCircle2 size={18} className="text-green-600" />
                  Files uploaded successfully!
                </div>
              )}

              {docUploadError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold mb-4">
                  {docUploadError}
                </div>
              )}

              {/* Uploader drag-drop box */}
              <div className="space-y-4">
                <label className="h-32 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-slate-50/30 cursor-pointer transition-colors text-center p-4">
                  <UploadCloud size={32} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Upload recitation audio, video, or essay file</span>
                  <span className="text-[10px] text-slate-400">Supported: PDF, JPG, PNG, DOCX, MP3, MP4 (Max 10MB)</span>
                  <input type="file" multiple onChange={handleFileSelection} className="hidden" />
                </label>

                {/* Queue list */}
                {docFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue:</span>
                    {docFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-2 border border-slate-100 bg-white rounded-lg text-xs">
                        <span className="truncate max-w-[200px] font-medium">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <Button
                      onClick={() => docUploadMutation.mutate()}
                      disabled={isUploadingDocs}
                      className="w-full h-10 rounded-xl text-xs font-bold mt-2"
                    >
                      {isUploadingDocs ? "Uploading files..." : "Submit Submissions"}
                    </Button>
                  </div>
                )}

                {/* Uploaded files listing */}
                {docsData?.documents && docsData.documents.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Files</span>
                    {docsData.documents.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <span className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          {doc.fileName}
                        </span>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline">
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Registration card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            {/* Quick specifications */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registration Fee</span>
                <span className="text-lg font-black text-slate-800 flex items-center gap-0.5">
                  <span className="text-slate-400 font-bold text-[15px] leading-none w-4 text-center">₦</span>
                  {parseFloat(comp.fee) === 0 ? "Free" : comp.fee}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registration Deadline</span>
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 font-bold">
                  <Calendar size={15} className="text-slate-400" />
                  {dateStr}
                </span>
              </div>
            </div>

            {/* Registration CTA Actions */}
            <div className="border-t border-slate-100 pt-5">
              {!isLoggedIn ? (
                <Link href={`/login?redirect=${encodeURIComponent(`/competitions/${compId}`)}`}>
                  <Button className="w-full h-11 rounded-xl font-bold text-xs">
                    Log in to Register
                  </Button>
                </Link>
              ) : !isStudent ? (
                <div className="text-xs text-slate-400 text-center font-medium bg-slate-50 border p-3 rounded-xl leading-relaxed">
                  ⚠️ Competitions are only open for student registrations.
                </div>
              ) : !isRegistered ? (
                <Button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending || comp.status !== "OPEN"}
                  className="w-full h-11 rounded-xl font-bold text-xs"
                >
                  {registerMutation.isPending ? "Registering..." : "Register Now"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Status</span>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge className="bg-green-100 text-primary border-none font-bold text-[9px] py-0.5 px-2">Registered</Badge>
                      {parseFloat(comp.fee) > 0 && (
                        <Badge className={clsx(
                          "border-none font-bold text-[9px] py-0.5 px-2",
                          isPendingPayment ? "bg-amber-100 text-amber-800" : "bg-green-100 text-primary"
                        )}>
                          {isPendingPayment ? "Awaiting Payment" : "Paid"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Payment upload block if paid and pending payment (FE-041 paid uploader) */}
                  {isPendingPayment && parseFloat(comp.fee) > 0 && (
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload Payment Proof</span>
                      
                      {paymentSuccess ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-[10px] font-semibold">
                          ✓ Receipt uploaded! Awaiting verification. (Simulated)
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {paymentError && <div className="text-[10px] text-red-600 font-semibold">{paymentError}</div>}
                          
                          <label className="h-10 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-center gap-1.5 bg-white text-xs text-slate-500 cursor-pointer font-semibold transition-colors">
                            <UploadCloud size={14} />
                            {proofFile ? "Change Receipt" : "Select Receipt PDF/Img"}
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setProofFile(f);
                                  setProofName(f.name);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {proofFile && (
                            <div className="text-[10px] text-slate-500 truncate font-semibold block">
                              File: {proofName}
                            </div>
                          )}

                          <Button
                            onClick={() => paymentMutation.mutate()}
                            disabled={isUploadingPayment || !proofFile}
                            className="w-full h-10 rounded-xl text-xs font-bold"
                          >
                            {isUploadingPayment ? "Uploading Proof..." : "Submit Payment Proof"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
