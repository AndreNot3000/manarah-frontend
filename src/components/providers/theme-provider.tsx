"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        // Register service worker in production
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("MANARAH PWA Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("MANARAH PWA Service Worker registration failed:", error);
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
