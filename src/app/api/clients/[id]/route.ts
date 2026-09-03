import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";

/**
 * Deleting the auth user is enough to delete everything else: every table that
 * belongs to a client references `profiles(id)` with `on delete cascade`, and
 * `profiles` cascades from `auth.users`. One row goes, all of it goes.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  if (id === guard.userId) {
    return Response.json(
      { error: "You cannot delete your own studio account." },
      { status: 400 }
    );
  }

  const admin = getAdminSupabase();
  // Their photos are not in the database and so are not cascaded; clear the
  // folder first, or the storage quota fills with files nothing points at.
  const { data: files } = await admin.storage.from("client-photos").list(id);
  if (files?.length) {
    await admin.storage
      .from("client-photos")
      .remove(files.map((f) => `${id}/${f.name}`));
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
