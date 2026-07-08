"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createAnnouncementAdmin } from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Megaphone, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mutation to broadcast announcement
  const mutation = useMutation({
    mutationFn: (data: { title: string; body: string }) => createAnnouncementAdmin(data),
    onSuccess: () => {
      setSuccess(true);
      setTitle("");
      setBody("");
      setErrorMsg(null);
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to broadcast announcement. Please try again.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMsg("Please complete both Title and Body content fields.");
      return;
    }
    mutation.mutate({ title, body });
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Megaphone className="text-primary" size={24} />
          Broadcast Alerts
        </h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          Send system-wide alerts & announcements notifications directly to all registered students, tutors, and administrators.
        </p>
      </div>

      <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-950 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold">
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
            <div className="space-y-0.5">
              <span>Announcement sent!</span>
              <p className="text-[10px] text-green-800 font-normal">Your notification has been dispatched in parallel to all active accounts.</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-950 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Announcement Title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Server Maintenance or New Quran Recitation Competition"
              className="rounded-xl h-11 text-xs font-medium border-slate-200"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Body Details</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide context regarding this update..."
              rows={6}
              className="w-full border border-slate-200 hover:border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              disabled={mutation.isPending}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-11 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-1.5"
            >
              {mutation.isPending ? "Broadcasting message..." : "Broadcast Alert Notification"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
