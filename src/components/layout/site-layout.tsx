"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const pathname = usePathname();
  
  // Identify if we are inside a dashboard layout (which already provides its own sidebars/headers)
  const isDashboard = 
    pathname.startsWith("/student-dashboard") || 
    pathname.startsWith("/tutor-dashboard") || 
    pathname.startsWith("/admin-dashboard");

  if (isDashboard) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container-app flex-1 py-6 pb-24 md:pb-6">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
