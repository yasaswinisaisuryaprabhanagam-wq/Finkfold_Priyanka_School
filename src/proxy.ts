import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16+ uses proxy.ts instead of middleware.ts
// This runs on every request and refreshes the Supabase session
// so cookies stay in sync between browser and server components.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 1. Skip network auth refresh for webhooks, static assets, and API routes that don't need user auth
  if (
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/whatsapp-reply")
  ) {
    return supabaseResponse;
  }

  // 2. Check if any Supabase auth cookies exist in the request
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  // If no auth cookie exists on public pages, return immediately without network latency
  if (!hasAuthCookie && (pathname === "/login" || pathname === "/" || pathname === "/reset-password")) {
    return supabaseResponse;
  }

  // 3. Refresh session cleanly and catch expired/invalid refresh tokens
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
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.getUser();
  } catch (err) {
    // Stale or invalid refresh token handled gracefully without blocking the UI
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
