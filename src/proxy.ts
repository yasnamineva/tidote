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
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
  // Everything except static assets and image files — without this the redirect
  // above would fire for stylesheets and photos too.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff2?)$).*)",
  ],
};
