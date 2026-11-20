"use client";

import { useQuery } from "@tanstack/react-query";
import { getOwnCertificates, API_URL } from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge, ListGridSkeleton } from "@/components/ui";
import { Award, Trophy, Download, Calendar } from "lucide-react";

export default function EarnedCertificatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["myCertificates"],
    queryFn: getOwnCertificates,
  });

  const certificates = data?.certificates || [];

  function getCertificateBadge(type: string) {
    switch (type) {
      case "WINNER":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 font-bold text-[10px] rounded-md py-0.5 px-2 flex items-center gap-1">
            <Trophy size={11} className="text-amber-500" />
            WINNER
          </Badge>
        );
      case "ACHIEVEMENT":
        return (
          <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-bold text-[10px] rounded-md py-0.5 px-2">
            ACHIEVEMENT
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold text-[10px] rounded-md py-0.5 px-2">
            PARTICIPATION
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">My Certificates</h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          View, print, and download your official achievements and participation awards.
        </p>
      </div>

      {isLoading ? (
        <ListGridSkeleton count={4} />
      ) : certificates.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Award size={36} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Certificates Earned Yet</CardTitle>
          <CardDescription className="max-w-xs mt-2 mx-auto">
            Once you participate in competitions and placements are published by admins, your awards will appear here.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const dateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const downloadUrl = `${API_URL}/certificates/${cert.id}/download`;

            return (
              <Card key={cert.id} className="p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="p-2.5 bg-emerald-50 text-primary rounded-xl border border-emerald-100">
                      <Award size={20} />
                    </span>
                    {getCertificateBadge(cert.type)}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{cert.competitionTitle}</h3>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Calendar size={12} />
                      Issued: {dateStr}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-end">
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full text-xs font-bold gap-1.5 h-9 rounded-lg">
                      <Download size={14} />
                      Download PDF
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
