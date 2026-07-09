"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { Button, ThemeToggle } from "@/components/ui";
import { 
  Home, 
  User, 
  MessageSquare, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/tutor-dashboard", label: "Dashboard", icon: Home },
  { href: "/tutor-dashboard/profile", label: "Profile", icon: User },
  { href: "/tutor-dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [localUser, setLocalUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setLocalUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Fetch current user details
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
  });

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  }

  if (isLoading && !localUser) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-slate-950">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading portal...
        </div>
      </div>
    );
  }

  const name = data?.profile?.name || localUser?.name || "Tutor";
  const email = data?.email || localUser?.email || "";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden w-full">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen overflow-y-auto shadow-sm shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-700 text-base font-bold text-white shadow-md shadow-green-100 dark:shadow-none">
            M
          </span>
          <span className="text-xl font-black tracking-wider text-primary dark:text-emerald-400">MANARAH</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform",
                  isActive 
                    ? "bg-gradient-to-r from-green-50 to-emerald-50/40 dark:from-emerald-950/20 dark:to-emerald-900/10 text-primary dark:text-emerald-400 border-l-4 border-primary shadow-sm font-bold scale-[1.02]" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1"
                )}
              >
                <Icon size={18} className={isActive ? "text-primary dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card Widget & Logout at the bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-emerald-950/40 flex items-center justify-center font-bold text-primary dark:text-emerald-400 border border-green-200 dark:border-emerald-900/50 overflow-hidden">
              {(data?.profile?.avatarUrl || data?.profile?.photoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(data.profile.avatarUrl || data.profile.photoUrl) ?? undefined} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono mt-0.5">{email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center gap-2 border-red-100 dark:border-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 rounded-xl py-3 h-auto font-bold transition-all duration-200"
          >
            <LogOut size={16} />
            Log out
          </Button>
          <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-semibold pt-1">
            © {new Date().getFullYear()} MANARAH. All rights reserved.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* Top Header for Mobile & Desktop context */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            <span className="text-md font-bold text-primary dark:text-emerald-400">MANARAH</span>
          </div>
          <div className="hidden md:block">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Tutor Portal</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 md:block hidden">
              Salaam, {name.split(" ")[0]}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-primary dark:text-emerald-400 border-2 border-primary-light dark:border-emerald-950 overflow-hidden">
              {(data?.profile?.avatarUrl || data?.profile?.photoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(data.profile.avatarUrl || data.profile.photoUrl) ?? undefined} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg md:hidden border-red-100 dark:border-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300"
              title="Log out"
            >
              <LogOut size={15} />
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-850 md:hidden h-16 shadow-lg flex items-stretch justify-around">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors",
                isActive ? "text-primary dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400"
              )}
            >
              <Icon size={20} className={isActive ? "text-primary dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
