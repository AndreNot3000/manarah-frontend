"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTutor, getCurrentUser, getSavedTutors, saveTutor, unsaveTutor, createInquiry } from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge } from "@/components/ui";
import { Heart, Send, CheckCircle2, ChevronLeft, Award, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const tutorId = resolvedParams.id;

  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // 1. Fetch tutor details
  const { data: tutorData, isLoading: isTutorLoading, error: tutorError } = useQuery({
    queryKey: ["tutorDetail", tutorId],
    queryFn: () => getTutor(tutorId),
  });

  // 2. Fetch current user profile to verify role and login status
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const isLoggedIn = !!profileData;
  const isStudent = profileData?.role === "STUDENT";

  // 3. Fetch saved tutors to check bookmark status
  const { data: savedData } = useQuery({
    queryKey: ["savedTutors"],
    queryFn: getSavedTutors,
    enabled: isLoggedIn && isStudent,
  });

  const isSaved = savedData?.tutors?.some((t) => t.tutorId === tutorId) || false;

  // Bookmark Toggle Mutations
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        router.push("/login?redirect=" + encodeURIComponent(`/tutors/${tutorId}`));
        return;
      }
      if (isSaved) {
        await unsaveTutor(tutorId);
      } else {
        await saveTutor(tutorId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedTutors"] });
    },
  });

  // Inquiry Submission Mutation
  const inquiryMutation = useMutation({
    mutationFn: () => createInquiry(tutorId, inquiryMsg),
    onSuccess: () => {
      setInquirySuccess(true);
      setInquiryMsg("");
      setInquiryError(null);
      setTimeout(() => {
        setInquirySuccess(false);
        setShowInquiryModal(false);
      }, 3000);
    },
    onError: (err: Error) => {
      setInquiryError(err.message || "Failed to send inquiry. Please try again.");
    },
  });

  if (isTutorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading tutor profile...
        </div>
      </div>
    );
  }

  if (tutorError || !tutorData?.tutor) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tutor Not Found</h2>
        <p className="text-sm text-slate-500">
          The tutor profile you are looking for does not exist or has been removed.
        </p>
        <Link href="/tutors">
          <Button variant="outline" className="rounded-xl">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const tutor = tutorData.tutor;

  function handleContactClick() {
    if (!isLoggedIn) {
      router.push("/login?redirect=" + encodeURIComponent(`/tutors/${tutorId}`));
      return;
    }
    setShowInquiryModal(true);
  }

  function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryMsg.trim()) return;
    inquiryMutation.mutate();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Back button link */}
      <div>
        <Link
          href="/tutors"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to marketplace
        </Link>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            {/* Large Avatar */}
            <div className="h-28 w-28 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center font-bold text-primary text-4xl overflow-hidden shadow-sm shrink-0">
              {tutor.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tutor.photoUrl} alt={tutor.name} className="h-full w-full object-cover" />
              ) : (
                tutor.name.charAt(0).toUpperCase()
              )}
            </div>

            <h1 className="text-xl font-black text-slate-800 mt-4 leading-tight">{tutor.name}</h1>
            
            <div className="flex items-center gap-1.5 mt-2">
              {tutor.status === "PREMIUM" && (
                <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[10px] rounded-md py-0.5 px-2 uppercase tracking-wider">
                  Premium
                </Badge>
              )}
              {tutor.status === "VERIFIED" && (
                <Badge className="bg-green-100 text-primary border-none font-bold text-[10px] rounded-md py-0.5 px-2 uppercase tracking-wider">
                  Verified
                </Badge>
              )}
            </div>

            {/* Quick metrics */}
            <div className="w-full border-t border-b border-slate-100 py-4 my-5 grid grid-cols-2 gap-4">
              <div className="space-y-0.5 border-r border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hourly Rate</span>
                <span className="text-sm font-black text-slate-700">
                  {tutor.pricing ? `₦${tutor.pricing}/hr` : "On Request"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience</span>
                <span className="text-sm font-bold text-slate-700 truncate block">
                  {tutor.experience || "N/A"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full space-y-2.5">
              {(!isLoggedIn || isStudent) && (
                <Button
                  onClick={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isPending}
                  variant={isSaved ? "outline" : "primary"}
                  className="w-full h-11 rounded-xl font-bold text-xs gap-2"
                >
                  <Heart size={14} className={isSaved ? "fill-red-500 text-red-500 animate-pulse" : ""} />
                  {isSaved ? "Saved" : "Save Tutor"}
                </Button>
              )}
              
              <Button
                onClick={handleContactClick}
                disabled={isLoggedIn && !isStudent}
                className="w-full h-11 rounded-xl font-bold text-xs gap-2 bg-gradient-to-r from-primary to-green-700 text-white"
              >
                <MessageSquare size={14} />
                {isLoggedIn && !isStudent ? "Inquiries Only for Students" : "Send Inquiry"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Profile Content Body */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio block */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">About Me</h2>
            {tutor.bio ? (
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {tutor.bio}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No bio available for this tutor profile.</p>
            )}
          </Card>

          {/* Subjects block */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 font-bold">Specialized Subjects</h2>
            <div className="flex gap-2 flex-wrap">
              {tutor.subjects.map((sub) => (
                <Badge
                  key={sub}
                  className="text-xs border border-slate-200 text-slate-600 bg-slate-50 font-bold px-3 py-1.5 rounded-xl capitalize"
                >
                  {sub.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Availability details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Availability</h2>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
              <Clock size={16} className="text-slate-400" />
              <span>{tutor.availability || "Please inquire about weekly scheduling."}</span>
            </div>
          </Card>

          {/* Qualifications & Certificates list */}
          {tutor.qualifications && tutor.qualifications.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Qualifications & Certificates</h2>
              <div className="space-y-3">
                {tutor.qualifications.map((q) => (
                  <div key={q.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                      <Award size={16} className="text-primary" />
                      {q.title}
                    </span>
                    <a
                      href={q.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Send Inquiry Modal/Dialog overlay */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Send Inquiry</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Send a private message to {tutor.name} to discuss schedule and lessons.
                </CardDescription>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {inquirySuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 size={18} className="text-green-600" />
                Your inquiry was sent successfully.
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 pt-2">
                {inquiryError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold">
                    {inquiryError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message</label>
                  <textarea
                    placeholder="Introduce yourself, describe your learning goals, and ask about availability..."
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    required
                    className="w-full h-32 p-3 text-xs border-2 border-slate-200 rounded-xl focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInquiryModal(false)}
                    className="rounded-xl h-10 px-4 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={inquiryMutation.isPending || !inquiryMsg.trim()}
                    className="rounded-xl h-10 px-5 text-xs font-semibold gap-1.5"
                  >
                    {inquiryMutation.isPending ? "Sending..." : "Send Message"}
                    <Send size={12} />
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
