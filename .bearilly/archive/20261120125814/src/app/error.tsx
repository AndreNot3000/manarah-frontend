"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Segment Level Exception:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center p-6 min-h-[300px]">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm space-y-4">
        {/* Visual Alert Icon */}
        <div className="mx-auto h-12 w-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle size={24} />
        </div>

        {/* Heading context */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">Failed to Load Section</h3>
          <p className="text-xs text-slate-500 font-medium leading-normal">
            There was an error rendering this part of the page.
          </p>
        </div>

        {/* Action Trigger */}
        <div className="pt-1 flex gap-2">
          <Button
            onClick={() => reset()}
            variant="outline"
            className="w-full h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
