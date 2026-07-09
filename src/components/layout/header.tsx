"use client";

import Link from "next/link";
import { Button, ButtonLink, ThemeToggle } from "@/components/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/tutors", label: "Tutors" },
  { href: "/competitions", label: "Competitions" },
];

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    function checkUser() {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }

    // Initial check
    checkUser();

    // Listen to changes
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setUser(null);
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  }

  const dashboardUrl = user?.role === "STUDENT" ? "/student-dashboard" : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-border bg-white/95 backdrop-blur dark:bg-slate-950/95 dark:border-slate-800">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
          <span className="text-lg font-bold text-primary">MANARAH</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body font-medium text-neutral-text dark:text-slate-200 transition-colors hover:text-primary dark:hover:text-emerald-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <ButtonLink href={dashboardUrl} variant="ghost" size="sm">
                Dashboard
              </ButtonLink>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Log out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Register
              </ButtonLink>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              Log out
            </Button>
          ) : (
            <ButtonLink href="/login" variant="outline" size="sm">
              Log in
            </ButtonLink>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
