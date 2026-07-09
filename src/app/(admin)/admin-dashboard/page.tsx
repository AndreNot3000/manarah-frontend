"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/api";
import { Card } from "@/components/ui";
import { Users, GraduationCap, Award, Trophy, FileText, AlertCircle, ShieldAlert } from "lucide-react";

export default function AdminDashboardIndex() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await getAdminStats();
      return res.stats;
    },
  });

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
              Loading metrics...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", val: statsData?.totalUsers || 0, desc: "Registered accounts", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Students", val: statsData?.students || 0, desc: "Learners", icon: GraduationCap, color: "text-green-600 bg-green-50 border-green-100" },
    { title: "Tutors", val: statsData?.tutors || 0, desc: "Educators", icon: Award, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { title: "Competitions", val: statsData?.competitions || 0, desc: "Total events created", icon: Trophy, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Registrations", val: statsData?.registrations || 0, desc: "Participations", icon: FileText, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Pending Tutors", val: statsData?.pendingTutors || 0, desc: "Awaiting approval", icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-100" },
    { title: "Pending Payments", val: statsData?.pendingPayments || 0, desc: "Receipts to verify", icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Stats Overview</h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          Real-time aggregates of users, tutors, and competition activity on MANARAH.
        </p>
      </div>

      {/* Verification alerts */}
      {statsData?.pendingTutors && statsData.pendingTutors > 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-950 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
          <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Action Required: Pending Tutor Applications</h4>
            <p className="text-xs text-red-800 leading-relaxed">
              There are <span className="font-bold">{statsData.pendingTutors}</span> tutors currently awaiting verification. Please review their credentials and qualify them.
            </p>
          </div>
        </div>
      ) : null}

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="p-6 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {c.title}
                </span>
                <span className="text-3xl font-black text-slate-800 leading-none">
                  {c.val}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {c.desc}
                </p>
              </div>
              <span className={`p-3 rounded-2xl border shrink-0 ${c.color}`}>
                <Icon size={24} />
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
