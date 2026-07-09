import { LoginFormData } from "./validations/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.dispatchEvent(new Event("storage"));
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const text = await res.text();
  let result: unknown = null;
  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    result = text;
  }

  if (!res.ok) {
    let message = `HTTP Error ${res.status}`;
    let code: string | undefined;

    if (result && typeof result === "object") {
      const resObj = result as Record<string, unknown>;
      if (typeof resObj.error === "string") {
        message = resObj.error;
      }
      if (typeof resObj.code === "string") {
        code = resObj.code;
      }
    }

    const error = new Error(message);
    if (code) {
      Object.assign(error, { code });
    }
    throw error;
  }

  return result as T;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "STUDENT" | "TUTOR" | "ADMIN";
    name: string;
  };
}

export function loginUser(data: Omit<LoginFormData, "rememberMe">): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerStudent(data: {
  email: string;
  name: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register/student", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerTutor(data: {
  email: string;
  name: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register/tutor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  profile: {
    name: string;
    phone?: string | null;
    avatarUrl?: string | null;
    photoUrl?: string | null;
    status?: string | null;
    bio?: string | null;
    experience?: string | null;
    availability?: string | null;
    pricing?: string | null;
  } | null;
}

export function getCurrentUser(): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>("/users/me");
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(data: { token: string; newPassword: string }): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProfile(formData: FormData): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>("/users/me", {
    method: "PATCH",
    body: formData,
  });
}

export interface SavedTutorItem {
  tutorId: string;
  name: string;
  photoUrl: string | null;
  status: "PENDING" | "VERIFIED" | "PREMIUM";
  pricing: string | null;
  subjects: string[];
  savedAt: string;
}

export interface CompetitionRegistrationItem {
  id: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  documents: { id: string; registrationId: string; fileName: string; fileUrl: string; uploadedAt: string }[];
  competition: {
    id: string;
    title: string;
    description: string;
    fee: string;
    deadline: string;
    category: string;
    type: string;
    status: string;
    createdAt: string;
  };
}

export interface MyCompetitionsResponse {
  registrations: CompetitionRegistrationItem[];
  meta: { page: number; limit: number; total: number };
}

export function getSavedTutors(): Promise<{ tutors: SavedTutorItem[] }> {
  return apiFetch<{ tutors: SavedTutorItem[] }>("/students/saved-tutors");
}

export function unsaveTutor(tutorId: string): Promise<void> {
  return apiFetch<void>(`/students/saved-tutors/${tutorId}`, {
    method: "DELETE",
  });
}

export function getMyCompetitions(): Promise<MyCompetitionsResponse> {
  return apiFetch<MyCompetitionsResponse>("/competitions/my");
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    unreadCount: number;
  };
}

export function getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<NotificationListResponse> {
  const queryParts: string[] = [];
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  if (params?.unreadOnly !== undefined) queryParts.push(`unreadOnly=${params.unreadOnly}`);
  
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<NotificationListResponse>(`/notifications${query}`);
}

export function markNotificationRead(id: string): Promise<{ notification: NotificationItem }> {
  return apiFetch<{ notification: NotificationItem }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export interface TutorListItem {
  id: string;
  name: string;
  photoUrl: string | null;
  status: "PENDING" | "VERIFIED" | "PREMIUM";
  pricing: string | null;
  experience: string | null;
  bio: string | null;
  subjects: string[];
}

export interface TutorDetail extends TutorListItem {
  availability: string | null;
  qualifications: { id: string; title: string; fileUrl: string }[];
}

export interface TutorListResponse {
  tutors: TutorListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function listTutors(params?: { subject?: string; q?: string; page?: number; limit?: number }): Promise<TutorListResponse> {
  const queryParts: string[] = [];
  if (params?.subject) queryParts.push(`subject=${params.subject}`);
  if (params?.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<TutorListResponse>(`/tutors${query}`);
}

export function getTutor(id: string): Promise<{ tutor: TutorDetail }> {
  return apiFetch<{ tutor: TutorDetail }>(`/tutors/${id}`);
}

export function saveTutor(tutorId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/students/saved-tutors/${tutorId}`, {
    method: "POST",
  });
}

export function createInquiry(tutorId: string, message: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/tutors/inquiries", {
    method: "POST",
    body: JSON.stringify({ tutorId, message }),
  });
}

export interface OwnTutorProfile extends TutorDetail {
  email: string;
}

export interface TutorInquiryItem {
  id: string;
  tutorId: string;
  message: string;
  status: "PENDING" | "RESPONDED" | "CLOSED";
  createdAt: string;
  student: {
    id: string;
    name: string;
  };
}

export interface TutorInquiryListResponse {
  inquiries: TutorInquiryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function getOwnTutorProfile(): Promise<{ tutor: OwnTutorProfile }> {
  return apiFetch<{ tutor: OwnTutorProfile }>("/tutors/me");
}

export function updateOwnTutorProfile(formData: FormData): Promise<{ tutor: OwnTutorProfile }> {
  return apiFetch<{ tutor: OwnTutorProfile }>("/tutors/me", {
    method: "PATCH",
    body: formData,
  });
}

export function getTutorInquiries(params?: { page?: number; limit?: number }): Promise<TutorInquiryListResponse> {
  const queryParts: string[] = [];
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<TutorInquiryListResponse>(`/tutors/me/inquiries${query}`);
}

export interface CompetitionListItem {
  id: string;
  title: string;
  description: string;
  fee: string;
  deadline: string;
  category: string;
  type: "QURAN_RECITATION" | "HIFZ" | "ISLAMIC_QUIZ" | "ARABIC_COMPETITION" | "ESSAY_COMPETITION";
  status: "DRAFT" | "OPEN" | "CLOSED" | "RESULTS_PUBLISHED";
  createdAt: string;
}

export interface CompetitionDetail extends CompetitionListItem {
  registrationCount: number;
  userRegistration?: {
    id: string;
    status: string;
    paymentStatus: string;
    documents: { id: string; registrationId: string; fileName: string; fileUrl: string; uploadedAt: string }[];
  };
  winners?: {
    userId: string;
    name: string;
    email: string;
    placement: number;
  }[];
}

export interface CompetitionListResponse {
  competitions: CompetitionListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function listCompetitions(params?: { type?: string; status?: string; page?: number; limit?: number }): Promise<CompetitionListResponse> {
  const queryParts: string[] = [];
  if (params?.type) queryParts.push(`type=${params.type}`);
  if (params?.status) queryParts.push(`status=${params.status}`);
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<CompetitionListResponse>(`/competitions${query}`);
}

export function getCompetitionDetail(id: string): Promise<{ competition: CompetitionDetail }> {
  return apiFetch<{ competition: CompetitionDetail }>(`/competitions/${id}`);
}

export interface RegistrationResponse {
  id: string;
  competitionId: string;
  userId: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export function registerCompetition(id: string): Promise<{ registration: RegistrationResponse }> {
  return apiFetch<{ registration: RegistrationResponse }>(`/competitions/${id}/register`, {
    method: "POST",
  });
}

export function uploadPaymentProof(formData: FormData): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/payments", {
    method: "POST",
    body: formData,
  });
}

export function uploadCompetitionDocuments(id: string, formData: FormData): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/competitions/${id}/documents`, {
    method: "POST",
    body: formData,
  });
}

export function listCompetitionDocuments(id: string): Promise<{ documents: { id: string; fileName: string; fileUrl: string; uploadedAt: string }[] }> {
  return apiFetch<{ documents: { id: string; fileName: string; fileUrl: string; uploadedAt: string }[] }>(`/competitions/${id}/documents`);
}

export interface AdminStats {
  totalUsers: number;
  students: number;
  tutors: number;
  admins: number;
  competitions: number;
  registrations: number;
  pendingTutors: number;
  pendingPayments: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  name: string;
  createdAt: string;
  status?: "PENDING" | "VERIFIED" | "PREMIUM";
}

export interface AdminUserListResponse {
  users: AdminUserItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ParticipantItem {
  registrationId: string;
  userId: string;
  name: string;
  email: string;
  registrationStatus: string;
  paymentStatus: string;
  registeredAt: string;
}

export interface ParticipantsResponse {
  competitionId: string;
  title: string;
  participants: ParticipantItem[];
  total: number;
}

export function getAdminStats(): Promise<{ stats: AdminStats }> {
  return apiFetch<{ stats: AdminStats }>("/admin/stats");
}

export function getAdminUsers(params?: { role?: string; page?: number; limit?: number }): Promise<AdminUserListResponse> {
  const queryParts: string[] = [];
  if (params?.role) queryParts.push(`role=${params.role}`);
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<AdminUserListResponse>(`/admin/users${query}`);
}

export function verifyTutor(tutorId: string, status: "VERIFIED" | "REJECTED"): Promise<{ id: string; status: string }> {
  return apiFetch<{ id: string; status: string }>(`/admin/tutors/${tutorId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export interface CompetitionAdminInput {
  title: string;
  description: string;
  fee: string | number;
  deadline: string;
  category: string;
  type: string;
  status?: string;
}

export function createCompetitionAdmin(data: CompetitionAdminInput): Promise<CompetitionListItem> {
  return apiFetch<CompetitionListItem>("/admin/competitions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCompetitionAdmin(id: string, data: Partial<CompetitionAdminInput>): Promise<CompetitionListItem> {
  return apiFetch<CompetitionListItem>(`/admin/competitions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getCompetitionParticipantsAdmin(id: string): Promise<ParticipantsResponse> {
  return apiFetch<ParticipantsResponse>(`/admin/competitions/${id}/participants`);
}

export function publishResultsAdmin(id: string, data: { winners: { userId: string; placement: number }[] }): Promise<CompetitionListItem> {
  return apiFetch<CompetitionListItem>(`/admin/competitions/${id}/results`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CertificateResponseItem {
  id: string;
  userId: string;
  competitionId: string;
  competitionTitle: string;
  type: "PARTICIPATION" | "ACHIEVEMENT" | "WINNER";
  fileUrl: string;
  issuedAt: string;
}

export function getOwnCertificates(): Promise<{ certificates: CertificateResponseItem[] }> {
  return apiFetch<{ certificates: CertificateResponseItem[] }>("/certificates/me");
}

export function generateCertificateAdmin(data: { userId: string; competitionId: string; type: string }): Promise<{ certificate: CertificateResponseItem }> {
  return apiFetch<{ certificate: CertificateResponseItem }>("/admin/certificates/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CompetitionDocument {
  id: string;
  registrationId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export function getRegistrationDocumentsAdmin(id: string, regId: string): Promise<{ documents: CompetitionDocument[] }> {
  return apiFetch<{ documents: CompetitionDocument[] }>(`/admin/competitions/${id}/registrations/${regId}/documents`);
}

export function updatePaymentStatusAdmin(id: string, regId: string, status: "CONFIRMED" | "REJECTED"): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/competitions/${id}/registrations/${regId}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function createAnnouncementAdmin(data: { title: string; body: string }): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/admin/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { API_URL };
