import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs before every matched request, for one reason: Supabase access tokens
 * expire, and only a server response can write the refreshed cookie back. Skip
 * this and sessions die at seemingly random intervals.
 *
 * Note the filename. In Next 16 `middleware.ts` is deprecated and renamed to
 * `proxy.ts`; every Supabase guide still says middleware, and a file by that
 * name here would simply never run.
 */
const PROTECTED = ["/dashboard", "/admin"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Both names — see ./lib/supabase/client.ts.
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // This runs ahead of *every* request, the public brand pages included. With no
  // keys there is no session to refresh and nothing to guard, so it stands
  // aside — a site missing its database config should still serve its homepage.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // getUser, not getSession: it revalidates the token with Supabase rather than
  // trusting a cookie the browser could have written itself.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    // Come back to where they were headed once they are through.
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  /*
   * Only the routes that actually have a session to refresh.
   *
   * The usual advice is to match everything, and on a pure app that is right.
   * Here most traffic is the marketing site, where nobody is signed in and
   * there is nothing to refresh — and this function makes a network call to
   * Supabase on every request it sees. Matching everything would put a
   * round trip in front of every visitor's homepage, and bill for it: edge
   * requests over 10ms of CPU are charged, and the call adds origin transfer.
   *
   * Signed-in browsers refresh their own token client-side, so the pages left
   * out here lose nothing.
   */
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    // The reset link carries a session Supabase needs to set down in cookies.
    "/reset-password",
    "/api/:path*",
  ],
};
