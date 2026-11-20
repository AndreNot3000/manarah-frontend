"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        // First: unregister all existing service workers (kills old stale caches)
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          const unregisterAll = registrations.map((r) => r.unregister());
          Promise.all(unregisterAll).then(() => {
            // Also clear all caches manually as extra safety net
            if ("caches" in window) {
              caches.keys().then((cacheNames) => {
                cacheNames.forEach((name) => caches.delete(name));
              });
            }
            // Register the new self-destruct SW so it wipes any remaining caches
            navigator.serviceWorker
              .register("/sw.js")
              .catch((error) => {
                console.error("MANARAH PWA Service Worker registration failed:", error);
              });
          });
        });
      } else {
        // Unregister in development to prevent stale caches & Turbopack HMR conflicts
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then(() => {
              console.log("Dev Service Worker unregistered successfully");
            });
          }
        });
      }
    }
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
