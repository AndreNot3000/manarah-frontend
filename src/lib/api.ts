import type { AuthResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export { API_URL };

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface API error message if available
    const message =
      (data as { error?: string }).error ?? `Request failed with status ${res.status}`;
    const err = new Error(message) as Error & { code?: string; status: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterTutorInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  registerStudent: (input: RegisterStudentInput) =>
    apiFetch<AuthResponse>("/auth/register/student", { method: "POST", body: input }),

  registerTutor: (input: RegisterTutorInput) =>
    apiFetch<AuthResponse>("/auth/register/tutor", { method: "POST", body: input }),

  login: (input: LoginInput) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
    }),
};
