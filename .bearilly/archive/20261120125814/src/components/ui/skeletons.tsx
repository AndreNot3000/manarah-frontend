"use client";

import { Card } from "./card";

export function ListGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-6 border border-slate-200 shadow-sm space-y-4 animate-pulse bg-white rounded-2xl">
          {/* Header Layout */}
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-full bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            </div>
          </div>

          {/* Bio line lines */}
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded-md w-full" />
            <div className="h-3 bg-slate-100 rounded-md w-5/6" />
          </div>

          {/* Badges footer */}
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-slate-100 rounded-md w-16" />
            <div className="h-6 bg-slate-100 rounded-md w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RowListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-5 border border-slate-200 shadow-sm animate-pulse bg-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-slate-100 rounded-md w-20" />
              <div className="h-3 bg-slate-100 rounded-md w-32" />
            </div>
            <div className="h-5 bg-slate-100 rounded-md w-1/2" />
            <div className="space-y-1.5">
              <div className="h-3.5 bg-slate-100 rounded-md w-full" />
              <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
            </div>
          </div>
          <div className="flex md:flex-col items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="h-6 bg-slate-100 rounded-md w-20" />
            <div className="h-9 bg-slate-100 rounded-lg w-28" />
          </div>
        </Card>
      ))}
    </div>
  );
}
