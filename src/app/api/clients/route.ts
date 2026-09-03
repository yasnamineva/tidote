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
    return Response.json(
      { error: "A name, an email and a password of at least 8 characters." },
      { status: 400 }
    );
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
    return Response.json(
      { error: taken ? "That email already has an account." : error?.message },
      { status: taken ? 409 : 500 }
    );
  }

  // The signup trigger has already made the profile row; fill in what only the
  // studio knows, and give them the empty records the portal expects to find.
  const id = created.user.id;
  await admin.from("profiles").update({ name, phone }).eq("id", id);
  await admin.from("measurements").insert({ profile_id: id });
  await admin.from("delivery_info").insert({ profile_id: id, phone });

  const { data: profile } = await admin
    .from("profiles")
    .select(
      "id,name,email,phone,is_demo,measurements(*),delivery_info(*),wardrobe_items(*),orders(*,order_notes(*))"
    )
    .eq("id", id)
    .single();

  return Response.json({ client: toClient(profile as never) }, { status: 201 });
}
