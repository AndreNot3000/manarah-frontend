import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  let user: { role: string } | null = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      user = null;
    }
  }

  const { pathname } = request.nextUrl;

  const isStudentRoute = pathname.startsWith("/student-dashboard");
  const isTutorRoute = pathname.startsWith("/tutor-dashboard");
  const isAdminRoute = pathname.startsWith("/admin-dashboard");
  const isDashboardRoute = isStudentRoute || isTutorRoute || isAdminRoute;

  // Protect dashboard routes
  if (isDashboardRoute) {
    if (!token || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role checks
    if (user.role === "STUDENT" && !isStudentRoute) {
      return NextResponse.redirect(new URL("/student-dashboard", request.url));
    }
    if (user.role === "TUTOR" && !isTutorRoute) {
      return NextResponse.redirect(new URL("/tutor-dashboard", request.url));
    }
    if (user.role === "ADMIN" && !isAdminRoute) {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    }
  }

  // Protect login/register pages if already logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token && user) {
      if (user.role === "STUDENT") {
        return NextResponse.redirect(new URL("/student-dashboard", request.url));
      } else if (user.role === "TUTOR") {
        return NextResponse.redirect(new URL("/tutor-dashboard", request.url));
      } else if (user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin-dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student-dashboard/:path*",
    "/tutor-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/login",
    "/register",
  ],
};
