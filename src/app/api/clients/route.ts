import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";
import { toClient } from "@/lib/clients";

/**
 * The studio adds a client. That means creating a login, which needs the
 * service-role key, which is why this cannot happen in the browser.
 *
 * The account is created already confirmed: these are people the atelier has
 * measured in person, and making them chase a verification email to see their
 * own order would be friction for no security gained.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const phone = String(body?.phone ?? "").trim();

  if (!name || !email || password.length < 8) {
    return Response.json({ code: "bad_input" }, { status: 400 });
  }

  const admin = getAdminSupabase();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !created.user) {
    const taken = error?.message?.toLowerCase().includes("already");
    // GoTrue's own wording is English and written for developers. The studio
    // gets a code her own screen can put into her own language, and the
    // detail goes to the server log where it is actually useful.
    if (!taken) console.error("createUser failed:", error?.message);
    return Response.json(
      { code: taken ? "email_taken" : "server" },
      { status: taken ? 409 : 500 }
    );
  }

  // The signup trigger has already made the profile and the empty measurement
  // and delivery records — the same ones a client who registered themselves
  // gets. All that is left is what only the studio knows.
  const id = created.user.id;
  await admin.from("profiles").update({ name, phone }).eq("id", id);
  if (phone) await admin.from("delivery_info").update({ phone }).eq("profile_id", id);

  const { data: profile } = await admin
    .from("profiles")
    .select(
      "id,name,email,phone,is_demo,measurements(*),delivery_info(*),wardrobe_items(*),orders(*,order_notes(*))"
    )
    .eq("id", id)
    .single();

  return Response.json({ client: toClient(profile as never) }, { status: 201 });
}
