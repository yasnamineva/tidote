import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";

/**
 * The whole database as one JSON file.
 *
 * The free tier includes no automatic backups at all — not fewer, none. So this
 * is the backup: a button in the studio panel that puts a real file on her own
 * machine. Upgrading to Pro adds daily backups kept for a week and makes this a
 * convenience instead of the only copy.
 *
 * Photos are not in here. They live in object storage and would turn a small
 * file into a very large one; what this preserves is every record, including
 * the references saying which photo belonged to what.
 */
const TABLES = [
  "profiles",
  "measurements",
  "delivery_info",
  "orders",
  "order_notes",
  "wardrobe_items",
  "messages",
  "notifications",
  "ready_pieces",
  "bookings",
  "availability",
  "studio_settings",
  "expenses",
  "compliance_items",
] as const;

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const admin = getAdminSupabase();
  const dump: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    note: "Tidote Atelier full record export. Photos are stored separately.",
  };

  for (const table of TABLES) {
    const { data, error } = await admin.from(table).select("*");
    if (error) {
      return Response.json(
        { error: `Could not read ${table}: ${error.message}` },
        { status: 500 }
      );
    }
    dump[table] = data;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(dump, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tidote-backup-${stamp}.json"`,
      // A backup is a snapshot of the moment it was asked for.
      "Cache-Control": "no-store",
    },
  });
}
