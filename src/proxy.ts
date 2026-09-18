import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SCHOOL } from "@/lib/school-config";

// Next.js 16+ uses proxy.ts instead of middleware.ts
// Handles session synchronization, Campus Context header propagation,
// institutional subdomain routing, and role-based portal routing.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get("host") || "";

  // 1. Fast-path: Skip webhooks, WhatsApp callbacks, static assets
  if (
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/whatsapp-reply") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Subdomain Routing (SRM AP style student.*, faculty.*, admin.*)
  if (hostname.startsWith("student.") && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/student/login", request.url));
  }
  if (hostname.startsWith("faculty.") && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/faculty/login", request.url));
  }
  if (hostname.startsWith("admin.") && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 3. Auth cookie detection
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  // Helper for targeted portal login routing
  function getTargetLoginUrl(path: string): URL {
    let targetPath = "/login";
    if (path.startsWith("/portal/student")) {
      targetPath = "/student/login";
    } else if (path.startsWith("/portal/faculty")) {
      targetPath = "/faculty/login";
    } else if (path.startsWith("/portal/admin")) {
      targetPath = "/admin/login";
    }
    const loginUrl = new URL(targetPath, request.url);
    loginUrl.searchParams.set("redirectTo", path);
    return loginUrl;
  }

  // 4. Unauthenticated access guard for protected portal & dashboard routes
  const isProtectedPath = pathname.startsWith("/portal") || pathname.startsWith("/dashboard");
  if (!hasAuthCookie && isProtectedPath) {
    return NextResponse.redirect(getTargetLoginUrl(pathname));
  }

  // Public unauthenticated pages return immediately
  const isPublicAuthPage =
    pathname === "/login" ||
    pathname === "/student/login" ||
    pathname === "/faculty/login" ||
    pathname === "/admin/login" ||
    pathname === "/" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/academics") ||
    pathname.startsWith("/admissions") ||
    pathname.startsWith("/contact");

  if (!hasAuthCookie && isPublicAuthPage) {
    return NextResponse.next();
  }

  // 5. Resolve Active Campus Context from cookie or default school
  const activeBranchCookie = request.cookies.get("finkfold_active_school")?.value;
  const activeSchoolId = activeBranchCookie || SCHOOL.id;

  // Setup request headers to propagate campus context downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-school-id", activeSchoolId);
  requestHeaders.set("x-school-slug", SCHOOL.slug);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 6. Supabase session synchronization & role-based routing
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If protected path and user session is invalid/expired
    if (isProtectedPath && !user) {
      return NextResponse.redirect(getTargetLoginUrl(pathname));
    }

    // Role-based routing for root /portal or /dashboard paths
    if (
      user &&
      (pathname === "/portal" ||
        pathname === "/portal/" ||
        pathname === "/dashboard" ||
        pathname === "/dashboard/")
    ) {
      let destination = "/portal/faculty";
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, primary_role")
          .eq("id", user.id)
          .maybeSingle();

        const role = profile?.primary_role || profile?.role || "teacher";
        if (role === "super_admin" || role === "school_admin" || role === "branch_admin") {
          destination = "/portal/admin";
        } else if (role === "student" || role === "parent") {
          destination = "/portal/student";
        } else {
          destination = "/portal/faculty";
        }
      } catch {
        // Fallback destination
      }

      return NextResponse.redirect(new URL(destination, request.url));
    }
  } catch (err) {
    // Stale or invalid session handled gracefully without blocking
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
