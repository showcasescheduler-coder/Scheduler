import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const path = req.nextUrl.pathname;

  // Check if user is on homepage
  if (path === "/" && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // List of routes that require authentication
  const protectedRoutes = [
    "/dashboard/events",
    "/dashboard/routines",
    "/dashboard/tasks",
    "/dashboard/projects",
    "/dashboard/analytics",
  ];

  // Redirect to homepage if trying to access protected routes while not logged in
  if (protectedRoutes.some((route) => path.startsWith(route)) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
