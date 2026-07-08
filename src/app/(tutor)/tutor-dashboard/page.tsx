"use client";

import { useQuery } from "@tanstack/react-query";
import { getOwnTutorProfile, getTutorInquiries } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { AlertCircle, CheckCircle, Mail, Award, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TutorDashboard() {
  // Fetch own tutor profile
  const { data: tutorData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["tutorProfile"],
    queryFn: getOwnTutorProfile,
  });

  // Fetch inquiries list
  const { data: inquiriesData, isLoading: isInquiriesLoading } = useQuery({
    queryKey: ["tutorInquiries", 1],
    queryFn: () => getTutorInquiries({ page: 1, limit: 5 }),
  });

  if (isProfileLoading || isInquiriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading portal...
        </div>
      </div>
    );
  }

  const profile = tutorData?.tutor;
  const status = profile?.status || "PENDING";
  const inquiries = inquiriesData?.inquiries || [];
  const totalInquiries = inquiriesData?.meta?.total || 0;

  return (
    <div className="space-y-6">
      
      {/* Welcome Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Tutor Portal</h1>
        <p className="text-sm text-neutral-muted mt-0.5">Manage your tutoring profile and respond to students.</p>
      </div>

      {/* Verification Status Banner */}
      {status === "PENDING" ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Profile Pending Verification</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Our administration is currently reviewing your uploaded qualifications and credentials. Your profile will go live in the public directory once verified. We will send you an email confirmation.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 text-green-900 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
          <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Profile is Live & Verified</h4>
            <p className="text-xs text-green-800 leading-relaxed font-semibold">
              Students can now find you in the search directory and send lesson inquiries. Keep your availability updated!
            </p>
          </div>
        </div>
      )}

      {/* Overview stats & details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tutor card details */}
        <Card className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="h-16 w-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center font-bold text-primary text-xl overflow-hidden shrink-0">
                {profile?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile?.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">{profile?.name}</h3>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {status === "PREMIUM" && <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] rounded-md py-0.5 px-2">PREMIUM</Badge>}
                  {status === "VERIFIED" && <Badge className="bg-green-100 text-primary border-none font-bold text-[9px] rounded-md py-0.5 px-2">VERIFIED</Badge>}
                  {status === "PENDING" && <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] rounded-md py-0.5 px-2">PENDING APPROVAL</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 font-semibold text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[13px] leading-none shrink-0 w-3.5 text-center">₦</span>
                Rate: {profile?.pricing ? `₦${profile.pricing}/hr` : "On Request"}
              </span>
              <span className="flex items-center gap-1.5">
                <Award size={15} className="text-slate-400" />
                Experience: {profile?.experience || "Not set"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-slate-400" />
                Availability: {profile?.availability ? "Set" : "Not set"}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700">Subjects Taught</h4>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((sub) => (
                    <Badge key={sub} className="text-[10px] border border-slate-200 text-slate-600 bg-slate-50 font-bold px-2 py-0.5 rounded-lg">
                      {sub.replace("_", " ")}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No subjects selected.</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/tutor-dashboard/profile">
              <Button className="rounded-xl h-10 px-5 text-xs font-bold w-full sm:w-auto">
                Edit Profile Settings
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick total stats card */}
        <Card className="p-6 flex flex-col justify-between items-center text-center">
          <div className="space-y-2">
            <span className="p-4 bg-slate-100 rounded-full inline-flex text-slate-600 mb-2">
              <Mail size={24} />
            </span>
            <CardTitle className="text-3xl font-black text-slate-800 leading-none">
              {totalInquiries}
            </CardTitle>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Received Inquiries</p>
          </div>
          <Link href="/tutor-dashboard/inquiries" className="w-full">
            <Button variant="outline" className="w-full rounded-xl text-xs font-bold h-10 mt-6 gap-1">
              View Inbox
              <ArrowRight size={14} />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Inquiries List Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-bold text-slate-800">Recent Student Inquiries</CardTitle>
          {inquiries.length > 0 && (
            <Link href="/tutor-dashboard/inquiries">
              <span className="text-xs text-primary font-bold hover:underline cursor-pointer">View All</span>
            </Link>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {inquiries.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              No inquiries received yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-green-100 text-primary flex items-center justify-center font-bold text-[10px] uppercase">
                      {inq.student.name.charAt(0)}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{inq.student.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-8">
                    &quot;{inq.message}&quot;
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

    </div>
  );
}
