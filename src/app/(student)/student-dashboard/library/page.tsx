"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLibraryCategories,
  getLibraryBooks,
  getLibraryCourses,
  enrollCourse,
  getMyEnrollments,
} from "@/lib/api";
import { Button, Input, Card, Badge } from "@/components/ui";
import {
  BookOpen,
  GraduationCap,
  Download,
  Search,
  CheckCircle2,
  Clock,
  User,
  PlayCircle,
  FileText,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentLibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"all" | "books" | "courses">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["library-categories"],
    queryFn: getLibraryCategories,
  });

  // Books
  const { data: booksData, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["library-books", selectedCategory, searchQuery],
    queryFn: () => getLibraryBooks({ categoryId: selectedCategory || undefined, q: searchQuery || undefined }),
  });

  // Courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["library-courses", selectedCategory, searchQuery],
    queryFn: () => getLibraryCourses({ categoryId: selectedCategory || undefined, q: searchQuery || undefined }),
  });

  // My Enrollments
  const { data: enrollmentsData } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollments,
  });

  const enrolledCourseIds = new Set(enrollmentsData?.enrollments.map((e) => e.course.id));

  // Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      router.push(`/student-dashboard/library/courses/${courseId}`);
    },
  });

  const categories = categoriesData?.categories || [];
  const books = booksData?.books || [];
  const courses = coursesData?.courses || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-emerald-950 dark:text-emerald-400">
              <BookOpen size={24} />
            </span>
            Islamic Library & Courses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access Islamic books, read educational PDFs, and enroll in self-paced courses.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search books, courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Category Pills & Tabs Filter */}
      <div className="space-y-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === "all"
                ? "bg-primary text-white shadow-md shadow-green-100 dark:shadow-none"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Learning Material
          </button>
          <button
            onClick={() => setActiveTab("books")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "books"
                ? "bg-primary text-white shadow-md shadow-green-100 dark:shadow-none"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText size={16} /> Books ({books.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "courses"
                ? "bg-primary text-white shadow-md shadow-green-100 dark:shadow-none"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap size={16} /> Courses ({courses.length})
          </button>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter size={12} /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                !selectedCategory
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Courses Section */}
      {(activeTab === "all" || activeTab === "courses") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="text-primary dark:text-emerald-400" size={22} />
              Courses & Video Lessons
            </h2>
          </div>

          {isLoadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-850 animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <GraduationCap size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 font-medium">No courses available in this section yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.id);
                return (
                  <Card
                    key={course.id}
                    className="overflow-hidden flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        {course.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-green-900 flex items-center justify-center text-white">
                            <GraduationCap size={48} className="opacity-40" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-xs border-none font-bold">
                          {course.level}
                        </Badge>
                        {course.duration && (
                          <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs border-none font-semibold flex items-center gap-1">
                            <Clock size={12} /> {course.duration}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        {course.category && (
                          <span className="text-xs font-bold text-primary dark:text-emerald-400 uppercase tracking-wider">
                            {course.category.name}
                          </span>
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-1">
                          <User size={14} className="text-slate-400" />
                          <span>{course.instructor}</span>
                          <span className="text-slate-300">•</span>
                          <span>{course._count?.lessons || 0} lessons</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-5 pt-0">
                      {isEnrolled ? (
                        <Link href={`/student-dashboard/library/courses/${course.id}`}>
                          <Button variant="outline" className="w-full justify-center gap-2 border-primary text-primary font-bold hover:bg-green-50">
                            <PlayCircle size={18} /> Continue Learning
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending}
                          className="w-full justify-center gap-2 font-bold bg-primary hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 size={18} /> Enroll Now (Free)
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Books Section */}
      {(activeTab === "all" || activeTab === "books") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="text-primary dark:text-emerald-400" size={22} />
              Islamic Books & Reading Materials
            </h2>
          </div>

          {isLoadingBooks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-850 animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 font-medium">No books available in this category yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex gap-4">
                    {/* Cover Thumbnail */}
                    <div className="h-28 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-green-50 to-emerald-100 text-primary dark:from-emerald-950 dark:to-slate-900">
                          <BookOpen size={24} />
                          <span className="text-[9px] font-bold mt-1 line-clamp-2">{book.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Book Metadata */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      {book.category && (
                        <span className="text-[10px] font-bold text-primary dark:text-emerald-400 uppercase tracking-wider block">
                          {book.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        By {book.author}
                      </p>
                      {book.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Download Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <a href={book.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Button variant="outline" className="w-full justify-center gap-2 rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Download size={14} /> Download PDF
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
