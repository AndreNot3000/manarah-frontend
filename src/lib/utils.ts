import { type ClassValue, clsx } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function togglePassword(setVisibility: React.Dispatch<React.SetStateAction<boolean>>) {
  setVisibility((prev) => !prev);
}

const getBackendOrigin = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:4000";
  }
};

export function getProfileImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  const origin = getBackendOrigin();

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
      return `${origin}${parsedUrl.pathname}`;
    }
    return url;
  } catch {
    if (url.startsWith("/")) {
      return `${origin}${url}`;
    }
    return `${origin}/uploads/avatars/${url}`;
  }
}

export function getCleanFileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  const origin = getBackendOrigin();

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
      return `${origin}${parsedUrl.pathname}`;
    }
    return url;
  } catch {
    if (url.startsWith("/")) {
      return `${origin}${url}`;
    }
    return `${origin}/${url}`;
  }
}

