import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This route handles:
// 1. Email confirmation links (token_hash + type=email)
// 2. Password reset links (token_hash + type=recovery)
// 3. OAuth callbacks (code param)
// Supabase sends users here after clicking the email link.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as
    | "email"
    | "recovery"
    | "magiclink"
    | null;
  const next = requestUrl.searchParams.get("next") ?? "/portal/faculty";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in Server Component context
          }
        },
      },
    }
  );

  // --- Handle PKCE code exchange (OAuth / magic link) ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect password recovery to the reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // --- Handle token_hash (email confirmation / password recovery email links) ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Something went wrong — send back to login with an error message
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", requestUrl.origin)
  );
}
