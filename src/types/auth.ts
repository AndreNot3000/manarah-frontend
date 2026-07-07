export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}
