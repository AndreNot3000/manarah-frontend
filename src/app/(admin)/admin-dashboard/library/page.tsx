"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListBooks,
  adminDeleteBook,
  adminListCourses,
  adminDeleteCourse,
  adminListLessons,
  adminDeleteLesson,
  ResourceCategory,
  BookItem,
  CourseItem,
  CourseLessonItem,
} from "@/lib/api";
import { Button, Input, Card, Badge } from "@/components/ui";
import {
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Video,
  X,
  Layers,
  List,
  CheckCircle2,
  AlertCircle,
  Upload,
  CloudUpload,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── XHR Upload with Progress ────────────────────────────────────────────────

function xhrUpload<T>(
  url: string,
  formData: FormData,
  onProgress: (pct: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as T);
        } else {
          reject(new Error(data?.error || `HTTP ${xhr.status}`));
        }
      } catch {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error. Please try again."));
    xhr.send(formData);
  });
}

function xhrPatch<T>(
  url: string,
  formData: FormData,
  onProgress: (pct: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", url);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as T);
        } else {
          reject(new Error(data?.error || `HTTP ${xhr.status}`));
        }
      } catch {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error. Please try again."));
    xhr.send(formData);
  });
}

// ─── Upload Progress Bar Component ──────────────────────────────────────────

function UploadProgressBar({
  progress,
  label,
  error,
  success,
}: {
  progress: number;
  label: string;
  error?: string | null;
  success?: boolean;
}) {
  if (error) {
    return (
      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
        <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-red-700 dark:text-red-400">Upload Failed</p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {label} saved successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CloudUpload size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="text-xs font-black text-primary tabular-nums">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 text-center">
        {progress < 100
          ? "Uploading to cloud storage, please wait…"
          : "Processing on server, almost done…"}
      </p>
    </div>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${
        type === "success" ? "bg-emerald-500" : "bg-red-500"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminLibraryPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"categories" | "books" | "courses">("books");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Modals
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; item?: ResourceCategory | null }>({ open: false });
  const [bookModal, setBookModal] = useState<{ open: boolean; item?: BookItem | null }>({ open: false });
  const [courseModal, setCourseModal] = useState<{ open: boolean; item?: CourseItem | null }>({ open: false });
  const [lessonsModal, setLessonsModal] = useState<{ open: boolean; course?: CourseItem | null }>({ open: false });
  const [lessonEditModal, setLessonEditModal] = useState<{ open: boolean; item?: CourseLessonItem | null }>({ open: false });

  // Upload state
  const [bookUpload, setBookUpload] = useState<{ progress: number; uploading: boolean; error: string | null; success: boolean }>({ progress: 0, uploading: false, error: null, success: false });
  const [courseUpload, setCourseUpload] = useState<{ progress: number; uploading: boolean; error: string | null; success: boolean }>({ progress: 0, uploading: false, error: null, success: false });
  const [lessonUpload, setLessonUpload] = useState<{ progress: number; uploading: boolean; error: string | null; success: boolean }>({ progress: 0, uploading: false, error: null, success: false });

  // Category form
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Book form
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDesc, setBookDesc] = useState("");
  const [bookCatId, setBookCatId] = useState("");
  const [bookIsPublished, setBookIsPublished] = useState(true);
  const [bookCoverFile, setBookCoverFile] = useState<File | null>(null);
  const [bookPdfFile, setBookPdfFile] = useState<File | null>(null);

  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCatId, setCourseCatId] = useState("");
  const [courseLevel, setCourseLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseIsPublished, setCourseIsPublished] = useState(true);
  const [courseThumbFile, setCourseThumbFile] = useState<File | null>(null);

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonOrder, setLessonOrder] = useState<number>(1);
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);

  // ─── Queries ─────────────────────────────────────────────────────────────

  const { data: categoriesData } = useQuery({ queryKey: ["admin-categories"], queryFn: adminListCategories });
  const { data: booksData } = useQuery({ queryKey: ["admin-books"], queryFn: adminListBooks });
  const { data: coursesData } = useQuery({ queryKey: ["admin-courses"], queryFn: adminListCourses });

  const selectedCourse = lessonsModal.course;
  const { data: lessonsData } = useQuery({
    queryKey: ["admin-lessons", selectedCourse?.id],
    queryFn: () => selectedCourse ? adminListLessons(selectedCourse.id) : Promise.resolve({ lessons: [] }),
    enabled: !!selectedCourse,
  });

  const categories = categoriesData?.categories || [];
  const books = booksData?.books || [];
  const courses = coursesData?.courses || [];
  const lessons = lessonsData?.lessons || [];

  // ─── Category ─────────────────────────────────────────────────────────────

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatSaving(true);
    try {
      if (categoryModal.item) {
        await adminUpdateCategory(categoryModal.item.id, { name: catName });
      } else {
        await adminCreateCategory({ name: catName });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setCategoryModal({ open: false });
      setCatName("");
      showToast("Category saved!", "success");
    } catch (err) {
      showToast((err as Error).message || "Failed to save category", "error");
    } finally {
      setCatSaving(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await adminDeleteCategory(id);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      showToast("Category deleted.", "success");
    } catch (err) {
      showToast((err as Error).message || "Delete failed", "error");
    }
  }

  // ─── Book ──────────────────────────────────────────────────────────────────

  function openBookForm(item?: BookItem | null) {
    if (item) {
      setBookTitle(item.title);
      setBookAuthor(item.author);
      setBookDesc(item.description || "");
      setBookCatId(item.categoryId);
      setBookIsPublished(item.isPublished);
    } else {
      setBookTitle(""); setBookAuthor(""); setBookDesc("");
      setBookCatId(categories[0]?.id || ""); setBookIsPublished(true);
    }
    setBookCoverFile(null); setBookPdfFile(null);
    setBookUpload({ progress: 0, uploading: false, error: null, success: false });
    setBookModal({ open: true, item });
  }

  async function handleSaveBook(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", bookTitle);
    formData.append("author", bookAuthor);
    formData.append("description", bookDesc);
    formData.append("categoryId", bookCatId);
    formData.append("isPublished", String(bookIsPublished));
    if (bookCoverFile) formData.append("cover", bookCoverFile);
    if (bookPdfFile) formData.append("file", bookPdfFile);

    setBookUpload({ progress: 0, uploading: true, error: null, success: false });

    try {
      if (bookModal.item) {
        await xhrPatch(`${API_URL}/admin/library/books/${bookModal.item.id}`, formData, (pct) =>
          setBookUpload((s) => ({ ...s, progress: pct }))
        );
      } else {
        await xhrUpload(`${API_URL}/admin/library/books`, formData, (pct) =>
          setBookUpload((s) => ({ ...s, progress: pct }))
        );
      }
      setBookUpload({ progress: 100, uploading: false, error: null, success: true });
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      showToast("Book saved successfully!", "success");
      setTimeout(() => setBookModal({ open: false }), 1200);
    } catch (err) {
      setBookUpload({ progress: 0, uploading: false, error: (err as Error).message || "Upload failed", success: false });
    }
  }

  async function handleDeleteBook(id: string) {
    if (!confirm("Delete this book?")) return;
    try {
      await adminDeleteBook(id);
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      showToast("Book deleted.", "success");
    } catch (err) {
      showToast((err as Error).message || "Delete failed", "error");
    }
  }

  // ─── Course ────────────────────────────────────────────────────────────────

  function openCourseForm(item?: CourseItem | null) {
    if (item) {
      setCourseTitle(item.title); setCourseInstructor(item.instructor);
      setCourseDesc(item.description || ""); setCourseCatId(item.categoryId);
      setCourseLevel(item.level); setCourseDuration(item.duration || "");
      setCourseIsPublished(item.isPublished);
    } else {
      setCourseTitle(""); setCourseInstructor(""); setCourseDesc("");
      setCourseCatId(categories[0]?.id || ""); setCourseLevel("BEGINNER");
      setCourseDuration(""); setCourseIsPublished(true);
    }
    setCourseThumbFile(null);
    setCourseUpload({ progress: 0, uploading: false, error: null, success: false });
    setCourseModal({ open: true, item });
  }

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", courseTitle);
    formData.append("instructor", courseInstructor);
    formData.append("description", courseDesc);
    formData.append("categoryId", courseCatId);
    formData.append("level", courseLevel);
    formData.append("duration", courseDuration);
    formData.append("isPublished", String(courseIsPublished));
    if (courseThumbFile) formData.append("thumbnail", courseThumbFile);

    setCourseUpload({ progress: 0, uploading: true, error: null, success: false });
    try {
      if (courseModal.item) {
        await xhrPatch(`${API_URL}/admin/library/courses/${courseModal.item.id}`, formData, (pct) =>
          setCourseUpload((s) => ({ ...s, progress: pct }))
        );
      } else {
        await xhrUpload(`${API_URL}/admin/library/courses`, formData, (pct) =>
          setCourseUpload((s) => ({ ...s, progress: pct }))
        );
      }
      setCourseUpload({ progress: 100, uploading: false, error: null, success: true });
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      showToast("Course saved successfully!", "success");
      setTimeout(() => setCourseModal({ open: false }), 1200);
    } catch (err) {
      setCourseUpload({ progress: 0, uploading: false, error: (err as Error).message || "Upload failed", success: false });
    }
  }

  async function handleDeleteCourse(id: string) {
    if (!confirm("Delete this course?")) return;
    try {
      await adminDeleteCourse(id);
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      showToast("Course deleted.", "success");
    } catch (err) {
      showToast((err as Error).message || "Delete failed", "error");
    }
  }

  // ─── Lesson ────────────────────────────────────────────────────────────────

  function openLessonForm(item?: CourseLessonItem | null) {
    if (item) {
      setLessonTitle(item.title); setLessonDesc(item.description || "");
      setLessonOrder(item.order); setLessonDuration(item.duration || "");
    } else {
      setLessonTitle(""); setLessonDesc("");
      setLessonOrder(lessons.length + 1); setLessonDuration("");
    }
    setLessonVideoFile(null);
    setLessonUpload({ progress: 0, uploading: false, error: null, success: false });
    setLessonEditModal({ open: true, item });
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;
    const formData = new FormData();
    formData.append("title", lessonTitle);
    formData.append("description", lessonDesc);
    formData.append("order", String(lessonOrder));
    formData.append("duration", lessonDuration);
    if (lessonVideoFile) formData.append("video", lessonVideoFile);

    setLessonUpload({ progress: 0, uploading: true, error: null, success: false });
    try {
      if (lessonEditModal.item) {
        await xhrPatch(`${API_URL}/admin/library/lessons/${lessonEditModal.item.id}`, formData, (pct) =>
          setLessonUpload((s) => ({ ...s, progress: pct }))
        );
      } else {
        await xhrUpload(`${API_URL}/admin/library/courses/${selectedCourse.id}/lessons`, formData, (pct) =>
          setLessonUpload((s) => ({ ...s, progress: pct }))
        );
      }
      setLessonUpload({ progress: 100, uploading: false, error: null, success: true });
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", selectedCourse.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      showToast("Lesson saved!", "success");
      setTimeout(() => setLessonEditModal({ open: false }), 1200);
    } catch (err) {
      setLessonUpload({ progress: 0, uploading: false, error: (err as Error).message || "Upload failed", success: false });
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    try {
      await adminDeleteLesson(lessonId);
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", selectedCourse?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      showToast("Lesson deleted.", "success");
    } catch (err) {
      showToast((err as Error).message || "Delete failed", "error");
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="py-4">
          <h1 className="text-[1.125rem] md:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-emerald-950 dark:text-emerald-400">
              <BookOpen size={24} />
            </span>
            Library & Courses Management
          </h1>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-1">
            Manage Islamic books (PDFs), course video lessons, and categories.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-evenly gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
          {(["books", "courses", "categories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 capitalize ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {tab === "books" && <FileText size={14} className="hidden md:block" />}
              {tab === "courses" && <GraduationCap size={14} className="hidden md:block" />}
              {tab === "categories" && <Layers size={14} className="hidden md:block" />}
              {tab === "books" ? `Books (${books.length})` : tab === "courses" ? `Courses (${courses.length})` : `Categories (${categories.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: BOOKS ──────────────────────────────────────────────────── */}
      {activeTab === "books" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Uploaded Books</h2>
            <Button onClick={() => openBookForm()} className="gap-2 font-bold bg-primary hover:bg-green-700">
              <Plus size={18} /> Add New Book
            </Button>
          </div>
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Book Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                        No books uploaded yet. Click &quot;Add New Book&quot; above.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="h-10 w-8 bg-slate-100 dark:bg-slate-800 rounded shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {book.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen size={16} className="m-auto text-slate-400 mt-2" />
                            )}
                          </div>
                          <span>{book.title}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{book.author}</td>
                        <td className="p-4">
                          <Badge variant="default" className="text-xs">{book.category?.name || "General"}</Badge>
                        </td>
                        <td className="p-4">
                          {book.isPublished ? (
                            <Badge className="bg-emerald-500 text-white border-none text-[10px]">Published</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openBookForm(book)}><Edit2 size={14} /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteBook(book.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: COURSES ─────────────────────────────────────────────────── */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Courses & Video Modules</h2>
            <Button onClick={() => openCourseForm()} className="gap-2 font-bold bg-primary hover:bg-green-700">
              <Plus size={18} /> Add New Course
            </Button>
          </div>
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Course Title</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Lessons</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                        No courses created yet. Click &quot;Add New Course&quot; above.
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="h-10 w-14 bg-slate-900 rounded shrink-0 overflow-hidden border border-slate-700">
                            {course.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap size={18} className="m-auto text-slate-500 mt-2" />
                            )}
                          </div>
                          <span>{course.title}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{course.instructor}</td>
                        <td className="p-4"><Badge variant="default" className="text-xs">{course.level}</Badge></td>
                        <td className="p-4 font-bold text-primary dark:text-emerald-400">{course._count?.lessons || 0} Lessons</td>
                        <td className="p-4">
                          {course.isPublished ? (
                            <Badge className="bg-emerald-500 text-white border-none text-[10px]">Published</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button size="sm" variant="outline" className="gap-1 font-bold text-xs" onClick={() => setLessonsModal({ open: true, course })}>
                            <List size={12} /> Manage Lessons
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openCourseForm(course)}><Edit2 size={14} /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 3: CATEGORIES ──────────────────────────────────────────────── */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resource Categories</h2>
            <Button onClick={() => { setCatName(""); setCategoryModal({ open: true }); }} className="gap-2 font-bold bg-primary hover:bg-green-700">
              <Plus size={18} /> Add Category
            </Button>
          </div>
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Books</th>
                    <th className="p-4">Courses</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                        No categories added yet.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                        <td className="p-4 text-slate-500 font-medium">{cat._count?.books || 0} Books</td>
                        <td className="p-4 text-slate-500 font-medium">{cat._count?.courses || 0} Courses</td>
                        <td className="p-4 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => { setCatName(cat.name); setCategoryModal({ open: true, item: cat }); }}>
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── MODAL: CATEGORY ────────────────────────────────────────────────── */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {categoryModal.item ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={() => setCategoryModal({ open: false })} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category Name</label>
                <Input required placeholder="e.g. Quranic Studies, Tajweed, Fiqh" value={catName} onChange={(e) => setCatName(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCategoryModal({ open: false })}>Cancel</Button>
                <Button type="submit" disabled={catSaving} className="bg-primary text-white font-bold">
                  {catSaving ? "Saving…" : "Save Category"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ─── MODAL: BOOK ────────────────────────────────────────────────────── */}
      {bookModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {bookModal.item ? "Edit Book" : "Add New Book"}
              </h3>
              <button onClick={() => !bookUpload.uploading && setBookModal({ open: false })} className="text-slate-400 hover:text-slate-600 disabled:opacity-30">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Book Title *</label>
                <Input required value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g. Sahih Al-Bukhari Summarized" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Author Name *</label>
                <Input required value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="e.g. Imam Al-Bukhari" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category *</label>
                <select required value={bookCatId} onChange={(e) => setBookCatId(e.target.value)} className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-semibold">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* PDF File with size hint */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Upload PDF File {!bookModal.item && "*"}
                </label>
                <div className="relative">
                  <Input type="file" accept="application/pdf" required={!bookModal.item} onChange={(e) => setBookPdfFile(e.target.files?.[0] || null)} />
                  {bookPdfFile && (
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      📄 {bookPdfFile.name} — {(bookPdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Cover Image (Optional)</label>
                <Input type="file" accept="image/*" onChange={(e) => setBookCoverFile(e.target.files?.[0] || null)} />
                {bookCoverFile && (
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                    🖼️ {bookCoverFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description (Optional)</label>
                <textarea rows={3} value={bookDesc} onChange={(e) => setBookDesc(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm" placeholder="Brief summary of the book..." />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="bookPublish" checked={bookIsPublished} onChange={(e) => setBookIsPublished(e.target.checked)} />
                <label htmlFor="bookPublish" className="text-xs font-bold text-slate-700 dark:text-slate-300">Publish book immediately to library</label>
              </div>

              {/* Progress / Status */}
              {(bookUpload.uploading || bookUpload.success || bookUpload.error) && (
                <UploadProgressBar
                  progress={bookUpload.progress}
                  label="Uploading Book to Cloud"
                  error={bookUpload.error}
                  success={bookUpload.success}
                />
              )}

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => !bookUpload.uploading && setBookModal({ open: false })} disabled={bookUpload.uploading}>Cancel</Button>
                <Button type="submit" disabled={bookUpload.uploading || bookUpload.success} className="bg-primary text-white font-bold gap-2">
                  {bookUpload.uploading ? (
                    <><Upload size={14} className="animate-bounce" /> Uploading…</>
                  ) : (
                    "Save Book"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ─── MODAL: COURSE ──────────────────────────────────────────────────── */}
      {courseModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {courseModal.item ? "Edit Course" : "Add New Course"}
              </h3>
              <button onClick={() => !courseUpload.uploading && setCourseModal({ open: false })} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course Title *</label>
                <Input required value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="e.g. Master Tajweed Rules in 30 Days" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Instructor Name *</label>
                <Input required value={courseInstructor} onChange={(e) => setCourseInstructor(e.target.value)} placeholder="e.g. Sheikh Abdullah" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category *</label>
                  <select required value={courseCatId} onChange={(e) => setCourseCatId(e.target.value)} className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-semibold">
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Difficulty Level</label>
                  <select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")} className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-semibold">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course Duration Text (Optional)</label>
                <Input value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="e.g. 4 Weeks, 10 Video Lessons" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Thumbnail Image (Optional)</label>
                <Input type="file" accept="image/*" onChange={(e) => setCourseThumbFile(e.target.files?.[0] || null)} />
                {courseThumbFile && (
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">🖼️ {courseThumbFile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course Overview & Syllabus</label>
                <textarea rows={3} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm" placeholder="What students will learn in this course..." />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="coursePublish" checked={courseIsPublished} onChange={(e) => setCourseIsPublished(e.target.checked)} />
                <label htmlFor="coursePublish" className="text-xs font-bold text-slate-700 dark:text-slate-300">Publish course immediately</label>
              </div>

              {(courseUpload.uploading || courseUpload.success || courseUpload.error) && (
                <UploadProgressBar
                  progress={courseUpload.progress}
                  label="Uploading Course Thumbnail"
                  error={courseUpload.error}
                  success={courseUpload.success}
                />
              )}

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => !courseUpload.uploading && setCourseModal({ open: false })} disabled={courseUpload.uploading}>Cancel</Button>
                <Button type="submit" disabled={courseUpload.uploading || courseUpload.success} className="bg-primary text-white font-bold gap-2">
                  {courseUpload.uploading ? (
                    <><Upload size={14} className="animate-bounce" /> Uploading…</>
                  ) : (
                    "Save Course"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ─── MODAL: LESSONS MANAGER ──────────────────────────────────────────── */}
      {lessonsModal.open && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <span className="text-xs font-bold text-primary dark:text-emerald-400 uppercase tracking-wider">Lessons Manager</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{selectedCourse.title}</h3>
              </div>
              <button onClick={() => setLessonsModal({ open: false })} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="flex justify-between items-center shrink-0">
              <p className="text-xs text-slate-500 font-semibold">{lessons.length} Lessons Added</p>
              <Button onClick={() => openLessonForm()} size="sm" className="gap-1.5 font-bold bg-primary hover:bg-green-700">
                <Plus size={16} /> Add Lesson
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
              {lessons.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed rounded-xl">
                  <Video size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No video lessons added to this course yet.</p>
                </div>
              ) : (
                lessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-[10px] font-bold">Lesson {lesson.order}</Badge>
                        {lesson.duration && <span className="text-xs text-slate-400 font-semibold">{lesson.duration}</span>}
                        {lesson.videoUrl && <Badge className="bg-emerald-500 text-white border-none text-[9px]">Video Ready</Badge>}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mt-1">{lesson.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openLessonForm(lesson)}><Edit2 size={14} /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteLesson(lesson.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ─── MODAL: ADD/EDIT LESSON ──────────────────────────────────────────── */}
      {lessonEditModal.open && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lessonEditModal.item ? "Edit Lesson" : "Add Lesson Module"}
              </h3>
              <button onClick={() => !lessonUpload.uploading && setLessonEditModal({ open: false })} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Title *</label>
                <Input required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="e.g. Introduction to Noon Sakinah" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Order #</label>
                  <Input type="number" required value={lessonOrder} onChange={(e) => setLessonOrder(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Duration</label>
                  <Input value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} placeholder="e.g. 15 mins" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Video (Cloudinary Streaming)</label>
                <Input type="file" accept="video/*" onChange={(e) => setLessonVideoFile(e.target.files?.[0] || null)} />
                {lessonVideoFile && (
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                    🎬 {lessonVideoFile.name} — {(lessonVideoFile.size / 1024 / 1024).toFixed(1)} MB
                    {lessonVideoFile.size > 100 * 1024 * 1024 && (
                      <span className="text-amber-500 ml-1">(Large file — upload may take several minutes)</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Notes (Optional)</label>
                <textarea rows={2} value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm" placeholder="Summary notes for students..." />
              </div>

              {/* Progress / Status */}
              {(lessonUpload.uploading || lessonUpload.success || lessonUpload.error) && (
                <UploadProgressBar
                  progress={lessonUpload.progress}
                  label="Uploading Video to Cloudinary"
                  error={lessonUpload.error}
                  success={lessonUpload.success}
                />
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => !lessonUpload.uploading && setLessonEditModal({ open: false })} disabled={lessonUpload.uploading}>Cancel</Button>
                <Button type="submit" disabled={lessonUpload.uploading || lessonUpload.success} className="bg-primary text-white font-bold gap-2">
                  {lessonUpload.uploading ? (
                    <><Upload size={14} className="animate-bounce" /> Uploading…</>
                  ) : (
                    "Save Lesson"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
