import { LoginFormData } from "./validations/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        if (typeof window !== "undefined" && path !== "/auth/login") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
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
    } catch (err: unknown) {
      lastError = err;

      // Don't retry on client validation or authentication errors (4xx HTTP errors)
      if (
        err instanceof Error &&
        (err.message === "Unauthorized" ||
          err.message.includes("Invalid") ||
          err.message.includes("already exists") ||
          err.message.includes("required"))
      ) {
        throw err;
      }

      // If we have remaining retries and it was a network drop / cold start timeout, wait and retry
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  if (lastError instanceof Error) {
    if (
      lastError.message === "Failed to fetch" ||
      lastError.message === "Load failed" ||
      lastError.message.includes("NetworkError") ||
      lastError.message.includes("network")
    ) {
      throw new Error("Unable to reach the server. Please check your internet connection and try again.");
    }
    throw lastError;
  }

  throw new Error("Network request failed. Please try again.");
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
  books: number;
  publishedBooks: number;
  courses: number;
  publishedCourses: number;
  courseEnrollments: number;
}

export type StatDetailKey =
  | "totalUsers"
  | "students"
  | "tutors"
  | "competitions"
  | "registrations"
  | "pendingTutors"
  | "pendingPayments"
  | "books"
  | "courses"
  | "courseEnrollments";

export function getStatDetail(key: StatDetailKey): Promise<{ key: string; items: Record<string, unknown>[] }> {
  return apiFetch(`/admin/stats/${key}`);
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

// ─── Library API Interfaces & Methods ───────────────────────────────────────

export interface ResourceCategory {
  id: string;
  name: string;
  _count?: { books: number; courses: number };
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverUrl: string | null;
  fileUrl: string;
  categoryId: string;
  category?: ResourceCategory;
  isPublished: boolean;
  createdAt: string;
}

export interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  description: string | null;
  thumbnailUrl: string | null;
  categoryId: string;
  category?: ResourceCategory;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: string | null;
  isPublished: boolean;
  createdAt: string;
  _count?: { lessons: number; enrollments: number };
}

export interface CourseLessonItem {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  order: number;
  duration: string | null;
}

export interface CourseDetail extends CourseItem {
  lessons: CourseLessonItem[];
}

export interface CourseProgressResponse {
  enrollment: {
    id: string;
    enrolledAt: string;
    completedAt: string | null;
  };
  progress: {
    totalLessons: number;
    completedCount: number;
    percentComplete: number;
    completedLessonIds: string[];
  };
  lessons: CourseLessonItem[];
}

export interface EnrollmentListItem {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  course: CourseItem;
  _count: { progress: number };
}

export function getLibraryCategories(): Promise<{ categories: ResourceCategory[] }> {
  return apiFetch<{ categories: ResourceCategory[] }>("/library/categories");
}

export function getLibraryBooks(params?: { categoryId?: string; q?: string; page?: number; limit?: number }): Promise<{ books: BookItem[]; meta: { page: number; limit: number; total: number } }> {
  const queryParts: string[] = [];
  if (params?.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
  if (params?.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<{ books: BookItem[]; meta: { page: number; limit: number; total: number } }>(`/library/books${query}`);
}

export function getLibraryBook(id: string): Promise<{ book: BookItem }> {
  return apiFetch<{ book: BookItem }>(`/library/books/${id}`);
}

export function getLibraryCourses(params?: { categoryId?: string; level?: string; q?: string; page?: number; limit?: number }): Promise<{ courses: CourseItem[]; meta: { page: number; limit: number; total: number } }> {
  const queryParts: string[] = [];
  if (params?.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
  if (params?.level) queryParts.push(`level=${params.level}`);
  if (params?.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return apiFetch<{ courses: CourseItem[]; meta: { page: number; limit: number; total: number } }>(`/library/courses${query}`);
}

export function getLibraryCourse(id: string): Promise<{ course: CourseDetail }> {
  return apiFetch<{ course: CourseDetail }>(`/library/courses/${id}`);
}

export function enrollCourse(courseId: string): Promise<{ enrollment: unknown; message: string }> {
  return apiFetch<{ enrollment: unknown; message: string }>(`/library/courses/${courseId}/enroll`, {
    method: "POST",
  });
}

export function getCourseProgress(courseId: string): Promise<CourseProgressResponse> {
  return apiFetch<CourseProgressResponse>(`/library/courses/${courseId}/progress`);
}

export function markLessonComplete(lessonId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/library/lessons/${lessonId}/complete`, {
    method: "POST",
  });
}

export function getMyEnrollments(): Promise<{ enrollments: EnrollmentListItem[] }> {
  return apiFetch<{ enrollments: EnrollmentListItem[] }>("/library/my-enrollments");
}

// ─── Admin Library API Methods ──────────────────────────────────────────────

export function adminListCategories(): Promise<{ categories: ResourceCategory[] }> {
  return apiFetch<{ categories: ResourceCategory[] }>("/admin/library/categories");
}

export function adminCreateCategory(data: { name: string }): Promise<{ category: ResourceCategory }> {
  return apiFetch<{ category: ResourceCategory }>("/admin/library/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdateCategory(id: string, data: { name: string }): Promise<{ category: ResourceCategory }> {
  return apiFetch<{ category: ResourceCategory }>(`/admin/library/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function adminDeleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/library/categories/${id}`, {
    method: "DELETE",
  });
}

export function adminListBooks(): Promise<{ books: BookItem[] }> {
  return apiFetch<{ books: BookItem[] }>("/admin/library/books");
}

export function adminCreateBook(formData: FormData): Promise<{ book: BookItem }> {
  return apiFetch<{ book: BookItem }>("/admin/library/books", {
    method: "POST",
    body: formData,
  });
}

export function adminUpdateBook(id: string, formData: FormData): Promise<{ book: BookItem }> {
  return apiFetch<{ book: BookItem }>(`/admin/library/books/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export function adminDeleteBook(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/library/books/${id}`, {
    method: "DELETE",
  });
}

export function adminListCourses(): Promise<{ courses: CourseItem[] }> {
  return apiFetch<{ courses: CourseItem[] }>("/admin/library/courses");
}

export function adminCreateCourse(formData: FormData): Promise<{ course: CourseItem }> {
  return apiFetch<{ course: CourseItem }>("/admin/library/courses", {
    method: "POST",
    body: formData,
  });
}

export function adminUpdateCourse(id: string, formData: FormData): Promise<{ course: CourseItem }> {
  return apiFetch<{ course: CourseItem }>(`/admin/library/courses/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export function adminDeleteCourse(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/library/courses/${id}`, {
    method: "DELETE",
  });
}

export function adminListLessons(courseId: string): Promise<{ lessons: CourseLessonItem[] }> {
  return apiFetch<{ lessons: CourseLessonItem[] }>(`/admin/library/courses/${courseId}/lessons`);
}

export function adminCreateLesson(courseId: string, formData: FormData): Promise<{ lesson: CourseLessonItem }> {
  return apiFetch<{ lesson: CourseLessonItem }>(`/admin/library/courses/${courseId}/lessons`, {
    method: "POST",
    body: formData,
  });
}

export function adminUpdateLesson(lessonId: string, formData: FormData): Promise<{ lesson: CourseLessonItem }> {
  return apiFetch<{ lesson: CourseLessonItem }>(`/admin/library/lessons/${lessonId}`, {
    method: "PUT",
    body: formData,
  });
}

export function adminDeleteLesson(lessonId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/library/lessons/${lessonId}`, {
    method: "DELETE",
  });
}

export function adminReorderLessons(courseId: string, lessons: { id: string; order: number }[]): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/library/courses/${courseId}/lessons/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ lessons }),
  });
}

export { API_URL };

