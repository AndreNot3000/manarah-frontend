"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyCompetitions } from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge, RowListSkeleton } from "@/components/ui";
import { Trophy, Calendar, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MyCompetitionsPage() {
  // Fetch my registrations
  const { data, isLoading } = useQuery({
    queryKey: ["myCompetitions"],
    queryFn: getMyCompetitions,
    refetchInterval: 5000, // Poll every 5 seconds to catch status updates automatically
  });

  const registrations = data?.registrations || [];

  // Status formatting helpers
  function getStatusBadge(status: string) {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-bold py-1 rounded-lg">Approved</Badge>;
      case "PENDING_PAYMENT":
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 font-bold py-1 rounded-lg">Pending Payment</Badge>;
      case "PENDING_VERIFICATION":
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-bold py-1 rounded-lg">Verifying Proof</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 font-bold py-1 rounded-lg">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold py-1 rounded-lg">{status}</Badge>;
    }
  }

  function getPaymentBadge(status: string) {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-bold py-1 rounded-lg">Paid</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold py-1 rounded-lg">Unpaid</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 font-bold py-1 rounded-lg">Payment Declined</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 font-bold py-1 rounded-lg">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">My Competitions</h1>
        <p className="text-sm text-neutral-muted mt-1">
          Track registration status, payment history, and documents for your competitions.
        </p>
      </div>

      {isLoading ? (
        <RowListSkeleton count={4} />
      ) : registrations.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Trophy size={32} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Registrations Found</CardTitle>
          <CardDescription className="max-w-sm mt-2">
            You haven&apos;t registered for any competitions yet. Explore open competitions to test your recitation, memorization, and Islamic knowledge.
          </CardDescription>
          <Link href="/competitions" className="mt-5">
            <Button className="font-semibold text-sm rounded-xl px-5 h-11">
              Explore Competitions
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const comp = reg.competition;
            const formattedDeadline = new Date(comp.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const registeredOn = new Date(reg.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Card key={reg.id} className="p-6 hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Competition info details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge className="bg-green-50 text-primary hover:bg-green-50 font-bold border-none text-[10px] rounded-md px-2 py-0.5 uppercase tracking-wider">
                        {comp.category}
                      </Badge>
                      <span className="text-xs text-neutral-muted font-medium">
                        Registered on {registeredOn}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800">{comp.title}</CardTitle>
                    <p className="text-sm text-slate-500 line-clamp-2">{comp.description}</p>
                    
                    {/* Grid metadata */}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        Deadline: {formattedDeadline}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} className="text-slate-400" />
                        Fee: {parseFloat(comp.fee) === 0 ? "Free" : `$${comp.fee}`}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges & Button */}
                  <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(reg.status)}
                      {parseFloat(comp.fee) > 0 && getPaymentBadge(reg.paymentStatus)}
                    </div>
                    
                    <Link href={`/competitions/${comp.id}`} className="md:w-auto">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-lg h-9 font-semibold">
                        View Details
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
