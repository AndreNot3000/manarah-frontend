"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLibraryCourse,
  getCourseProgress,
  markLessonComplete,
  CourseLessonItem,
} from "@/lib/api";
import { Button, Card, Badge } from "@/components/ui";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  GraduationCap,
  PlayCircle,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function StudentCoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const queryClient = useQueryClient();

  const [activeLesson, setActiveLesson] = useState<CourseLessonItem | null>(null);

  // Fetch Course details
  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => getLibraryCourse(courseId),
  });

  // Fetch Progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => getCourseProgress(courseId),
  });

  // Complete Lesson Mutation
  const completeMutation = useMutation({
    mutationFn: (lessonId: string) => markLessonComplete(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
    },
  });

  const course = courseData?.course;
  const lessons = progressData?.lessons || course?.lessons || [];
  const completedLessonIds = new Set(progressData?.progress.completedLessonIds || []);
  const percentComplete = progressData?.progress.percentComplete || 0;
  const isCourseFinished = percentComplete === 100 && lessons.length > 0;

  // Selected lesson fallback (first lesson)
  const currentLesson = activeLesson || lessons[0] || null;
  const isCurrentCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;

  if (isLoadingCourse || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="animate-pulse font-semibold text-primary">Loading course classroom...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Course Not Found</h2>
        <Link href="/student-dashboard/library">
          <Button variant="outline">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link href="/student-dashboard/library">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 font-semibold">
            <ChevronLeft size={18} /> Back to Library
          </Button>
        </Link>

        {isCourseFinished && (
          <Badge className="bg-emerald-500 text-white border-none py-1.5 px-3 font-bold gap-1 text-xs">
            <Award size={16} /> Course Completed! 🎉
          </Badge>
        )}
      </div>

      {/* Course Progress Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-emerald-400 uppercase tracking-wider mb-1">
            <GraduationCap size={16} /> {course.category?.name || "Islamic Studies"}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{course.title}</h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Instructor: {course.instructor} • {lessons.length} Lessons
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">Course Progress</span>
            <span className="text-primary dark:text-emerald-400">{percentComplete}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Player Grid: Video Area + Sidebar Lesson List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video & Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {currentLesson ? (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
                {currentLesson.videoUrl ? (
                  <video
                    key={currentLesson.id}
                    src={currentLesson.videoUrl}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400 space-y-2">
                    <PlayCircle size={48} className="mx-auto text-slate-600" />
                    <p className="text-sm font-medium">No video file uploaded for this lesson yet.</p>
                  </div>
                )}
              </div>

              {/* Lesson Details & Actions */}
              <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400">
                      Lesson {currentLesson.order} of {lessons.length}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {currentLesson.title}
                    </h2>
                  </div>

                  <Button
                    onClick={() => completeMutation.mutate(currentLesson.id)}
                    disabled={completeMutation.isPending || isCurrentCompleted}
                    variant={isCurrentCompleted ? "outline" : "primary"}
                    className={`gap-2 font-bold ${
                      isCurrentCompleted
                        ? "border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-400 bg-emerald-50/50"
                        : "bg-primary hover:bg-green-700 text-white"
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    {isCurrentCompleted ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>

                {currentLesson.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Lesson Notes & Summary
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentLesson.description}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed">
              <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 font-medium">No lessons added to this course yet.</p>
            </Card>
          )}
        </div>

        {/* Sidebar: Lesson List (1 col) */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center justify-between">
            <span>Course Outline</span>
            <span className="text-xs font-semibold text-slate-500">
              {completedLessonIds.size}/{lessons.length} Complete
            </span>
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {lessons.map((lesson, idx) => {
              const isSelected = currentLesson?.id === lesson.id;
              const isDone = completedLessonIds.has(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <Circle size={18} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-slate-400">Lesson {idx + 1}</span>
                      {lesson.duration && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock size={10} /> {lesson.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-1 leading-snug">{lesson.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
