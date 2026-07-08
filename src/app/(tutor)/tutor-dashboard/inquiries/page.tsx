"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTutorInquiries } from "@/lib/api";
import { Card, CardTitle, CardDescription, Badge, Button } from "@/components/ui";
import { Inbox, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function TutorInquiriesInbox() {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch inquiries list
  const { data, isLoading } = useQuery({
    queryKey: ["tutorInquiries", page],
    queryFn: () => getTutorInquiries({ page, limit }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading your inbox...
        </div>
      </div>
    );
  }

  const inquiries = data?.inquiries || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0 };
  const totalPages = Math.ceil(meta.total / limit) || 1;

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Inquiries Inbox</h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          View inquiries and lesson requests sent by students from the tutor directory.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Inbox size={32} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Inquiries Yet</CardTitle>
          <CardDescription className="max-w-sm mt-2 mx-auto">
            Your inquiry list is empty. Once your profile is active, student lesson requests will appear here.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const dateStr = new Date(inq.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card key={inq.id} className="p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-green-100 text-primary flex items-center justify-center font-black text-xs uppercase">
                        {inq.student.name.charAt(0)}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{inq.student.name}</span>
                      <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] rounded-md py-0.5 px-2 capitalize">
                        {inq.status.toLowerCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-wrap pl-9">
                      {inq.message}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <Calendar size={12} />
                    {dateStr}
                  </span>
                </div>
              </Card>
            );
          })}

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
    </div>
  );
}
