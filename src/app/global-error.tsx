"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to remote monitoring system if available
    console.error("Unhandled Application Exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-6">
          {/* Visual Alert Icon */}
          <div className="mx-auto h-16 w-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle size={32} />
          </div>

          {/* Heading context */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Something Went Wrong</h1>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              We encountered an unexpected error. Don&apos;t worry, your progress is safe. Try resetting the current view.
            </p>
          </div>

          {/* Details wrapper */}
          {error.message && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] font-mono text-slate-500 text-left overflow-x-auto max-h-[120px] select-all">
              <span className="font-bold text-red-600 uppercase block mb-1">Details:</span>
              {error.message}
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <Button
              onClick={() => reset()}
              className="w-full h-12 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-green-100"
            >
              <RotateCcw size={16} />
              Reset Portal State
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
