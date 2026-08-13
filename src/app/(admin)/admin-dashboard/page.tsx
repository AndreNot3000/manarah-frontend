"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminStats, getStatDetail, StatDetailKey } from "@/lib/api";
import { Card } from "@/components/ui";
import {
  Users, GraduationCap, Award, Trophy, FileText,
  AlertCircle, ShieldAlert, BookOpen, PlayCircle,
  X, ChevronRight, UserCheck, CreditCard,
} from "lucide-react";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCard {
  key: StatDetailKey;
  title: string;
  value: number;
  desc: string;
  icon: React.ElementType;
  color: string;
}

// ─── Drill-down panel columns ────────────────────────────────────────────────

function DetailPanel({
  statKey,
  title,
  onClose,
}: {
  statKey: StatDetailKey;
  title: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["statDetail", statKey],
    queryFn: () => getStatDetail(statKey),
  });

  const items = data?.items ?? [];

  // Column definitions per key
  function renderRow(item: Record<string, unknown>, idx: number) {
    const badge = (val: string, color: string) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{val}</span>
    );

    const statusColor = (s: unknown) => {
      const str = String(s ?? "");
      if (["VERIFIED", "CONFIRMED", "PUBLISHED"].some((v) => str.includes(v))) return "bg-green-100 text-green-700";
      if (["PENDING"].some((v) => str.includes(v))) return "bg-amber-100 text-amber-700";
      if (["REJECTED", "CLOSED"].some((v) => str.includes(v))) return "bg-red-100 text-red-700";
      return "bg-slate-100 text-slate-600";
    };

    switch (statKey) {
      case "totalUsers":
      case "students":
      case "tutors":
      case "pendingTutors":
        return (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white text-sm">{String(item.name ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.email ?? "—")}</td>
            <td className="py-2.5 px-4">{badge(String(item.role ?? item.status ?? "—"), statusColor(item.status ?? item.role))}</td>
            <td className="py-2.5 px-4 text-slate-400 text-xs">{item.createdAt ? new Date(String(item.createdAt)).toLocaleDateString() : "—"}</td>
          </tr>
        );

      case "competitions":
        return (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white text-sm">{String(item.title ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.type ?? "—").replace(/_/g, " ")}</td>
            <td className="py-2.5 px-4">{badge(String(item.status ?? "—"), statusColor(item.status))}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs font-bold">{String(item.registrations ?? 0)} participants</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">₦{String(item.fee ?? "0")}</td>
          </tr>
        );

      case "registrations":
      case "pendingPayments":
        return (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white text-sm">{String(item.userName ?? item.studentName ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.competitionTitle ?? item.courseTitle ?? "—")}</td>
            {statKey === "pendingPayments" && (
              <td className="py-2.5 px-4 text-slate-500 text-xs font-bold">₦{String(item.fee ?? "0")}</td>
            )}
            {statKey === "registrations" && (
              <td className="py-2.5 px-4">{badge(String(item.paymentStatus ?? "—"), statusColor(item.paymentStatus))}</td>
            )}
            <td className="py-2.5 px-4 text-slate-400 text-xs">{item.registeredAt ? new Date(String(item.registeredAt)).toLocaleDateString() : "—"}</td>
          </tr>
        );

      case "books":
        return (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white text-sm">{String(item.title ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.author ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.category ?? "—")}</td>
            <td className="py-2.5 px-4">{badge(item.isPublished ? "Published" : "Draft", item.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}</td>
          </tr>
        );

      case "courses":
        return (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white text-sm">{String(item.title ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.instructor ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.level ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs font-bold">{String(item.lessons ?? 0)} lessons</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs font-bold">{String(item.enrollments ?? 0)} enrolled</td>
            <td className="py-2.5 px-4">{badge(item.isPublished ? "Published" : "Draft", item.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}</td>
          </tr>
        );

      case "courseEnrollments":
        return (
          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white text-sm">{String(item.studentName ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-500 text-xs">{String(item.courseTitle ?? "—")}</td>
            <td className="py-2.5 px-4 text-slate-400 text-xs">{item.enrolledAt ? new Date(String(item.enrolledAt)).toLocaleDateString() : "—"}</td>
            <td className="py-2.5 px-4">{badge(item.completedAt ? "Completed" : "In Progress", item.completedAt ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}</td>
          </tr>
        );

      default:
        return null;
    }
  }

  function renderHeaders() {
    switch (statKey) {
      case "totalUsers": case "students": case "tutors": case "pendingTutors":
        return ["Name", "Email", "Role / Status", "Joined"];
      case "competitions":
        return ["Title", "Type", "Status", "Participants", "Fee"];
      case "registrations":
        return ["Student", "Competition", "Payment", "Date"];
      case "pendingPayments":
        return ["Student", "Competition", "Fee", "Registered"];
      case "books":
        return ["Title", "Author", "Category", "Status"];
      case "courses":
        return ["Title", "Instructor", "Level", "Lessons", "Enrolled", "Status"];
      case "courseEnrollments":
        return ["Student", "Course", "Enrolled", "Progress"];
      default:
        return [];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{items.length} records (max 50 shown)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <FileText size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">No records found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {renderHeaders().map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => renderRow(item as Record<string, unknown>, idx))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboardIndex() {
  const [activeDetail, setActiveDetail] = useState<{ key: StatDetailKey; title: string } | null>(null);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await getAdminStats();
      return res.stats;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-20">
        <div className="relative flex items-center justify-center h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
          <div className="absolute h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <span className="text-emerald-700 font-extrabold text-xs">M</span>
          </div>
        </div>
        <p className="mt-4 text-slate-500 text-sm animate-pulse">Loading metrics...</p>
      </div>
    );
  }

  const cards: StatCard[] = [
    {
      key: "totalUsers",
      title: "Total Users",
      value: statsData?.totalUsers ?? 0,
      desc: "Registered accounts",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      key: "students",
      title: "Students",
      value: statsData?.students ?? 0,
      desc: "Learners",
      icon: GraduationCap,
      color: "text-green-600 bg-green-50 border-green-100",
    },
    {
      key: "tutors",
      title: "Tutors",
      value: statsData?.tutors ?? 0,
      desc: "Educators",
      icon: Award,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      key: "competitions",
      title: "Competitions",
      value: statsData?.competitions ?? 0,
      desc: "Total events created",
      icon: Trophy,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      key: "registrations",
      title: "Registrations",
      value: statsData?.registrations ?? 0,
      desc: "Participations",
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      key: "pendingTutors",
      title: "Pending Tutors",
      value: statsData?.pendingTutors ?? 0,
      desc: "Awaiting approval",
      icon: AlertCircle,
      color: "text-red-600 bg-red-50 border-red-100",
    },
    {
      key: "pendingPayments",
      title: "Pending Payments",
      value: statsData?.pendingPayments ?? 0,
      desc: "Receipts to verify",
      icon: CreditCard,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
      key: "books",
      title: "Books",
      value: statsData?.books ?? 0,
      desc: `${statsData?.publishedBooks ?? 0} published`,
      icon: BookOpen,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      key: "courses",
      title: "Courses",
      value: statsData?.courses ?? 0,
      desc: `${statsData?.publishedCourses ?? 0} published`,
      icon: PlayCircle,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      key: "courseEnrollments",
      title: "Enrollments",
      value: statsData?.courseEnrollments ?? 0,
      desc: "Course participations",
      icon: UserCheck,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Stats Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Click any card to see the detailed list. Showing real-time data.
        </p>
      </div>

      {/* Action alert */}
      {(statsData?.pendingTutors ?? 0) > 0 && (
        <button
          onClick={() => setActiveDetail({ key: "pendingTutors", title: "Pending Tutor Applications" })}
          className="w-full text-left bg-red-50 border border-red-200 text-red-950 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:bg-red-100 transition-colors"
        >
          <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold">Action Required: Pending Tutor Applications</h4>
            <p className="text-xs text-red-800 leading-relaxed">
              There are <span className="font-bold">{statsData?.pendingTutors}</span> tutors currently awaiting verification. Click here to review them.
            </p>
          </div>
          <ChevronRight size={18} className="text-red-400 shrink-0 mt-0.5" />
        </button>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          const isActive = activeDetail?.key === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveDetail(isActive ? null : { key: c.key, title: c.title })}
              className={`text-left w-full rounded-2xl border p-5 flex items-center justify-between transition-all duration-150
                ${isActive
                  ? "ring-2 ring-primary shadow-md bg-primary/5 border-primary/30"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-primary/30"
                }
              `}
            >
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {c.title}
                </span>
                <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                  {c.value.toLocaleString()}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`p-3 rounded-2xl border shrink-0 ${c.color}`}>
                  <Icon size={22} />
                </span>
                <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
                  View <ChevronRight size={10} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Drill-down panel */}
      {activeDetail && (
        <DetailPanel
          statKey={activeDetail.key}
          title={activeDetail.title}
          onClose={() => setActiveDetail(null)}
        />
      )}
    </div>
  );
}
