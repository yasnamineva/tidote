import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";
import { sendEmail } from "@/lib/email";

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

  // Read before deleting: afterwards there is nobody left to tell.
  const { data: leaving } = await admin
    .from("profiles")
    .select("name,email")
    .eq("id", id)
    .maybeSingle();

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

  // Told afterwards, and never at the cost of the deletion itself: the records
  // are already gone, and a mail provider having a bad afternoon must not turn
  // that into an error the studio has to interpret. Sent through Resend, which
  // is separate from the confirmation and reset mail Supabase sends — so this
  // one arrives even while that is still limited to two an hour.
  let notified: "sent" | "not_sent" = "not_sent";
  if (leaving?.email) {
    const mail = await sendEmail({
      to: leaving.email,
      subject: "Your Tidote Atelier account has been closed",
      text: [
        `${leaving.name || "Hello"},`,
        "",
        "Your account at tidoteatelier.com has been closed and everything in",
        "it — measurements, orders, delivery details and photographs — has",
        "been deleted. Nothing of it is kept.",
        "",
        "If this was not expected, reply to this message and we will look into",
        "it.",
        "",
        "— Tidote Atelier",
      ].join("\n"),
    });
    notified = mail.sent ? "sent" : "not_sent";
  }

  return Response.json({ ok: true, notified });
}
