"use client";

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="flex flex-col items-center space-y-6">
        {/* Modern concentric animated spinner */}
        <div className="relative flex items-center justify-center h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
          <div className="absolute h-14 w-14 rounded-full border-4 border-slate-100 border-b-emerald-400 animate-spin-reverse" />
          <div className="absolute h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shadow-sm">
            <span className="text-emerald-700 font-extrabold text-xs tracking-wider">M</span>
          </div>
        </div>

        {/* Text indicators */}
        <div className="text-center space-y-1.5">
          <h3 className="text-slate-800 font-semibold text-base font-outfit tracking-wide animate-pulse">
            Loading Content...
          </h3>
          <p className="text-slate-400 text-xs tracking-wider">
            Preparing your learning portal
          </p>
        </div>
      </div>
    </div>
  );
}
