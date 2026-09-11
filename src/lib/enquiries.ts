import { getSupabase } from "@/lib/supabase/client";

/**
 * Questions from people without accounts.
 *
 * Read by the studio only — the table has one policy and it is `is_admin()`.
 * They arrive through /api/enquiries, which is the only thing that may write
 * one; this side just reads them and marks them dealt with.
 */
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  pieceName: string;
  lang: string;
  handled: boolean;
  createdAt: string;
};

const COLUMNS =
  "id,name,email,phone,message,piece_name,lang,handled,created_at";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  piece_name: string;
  lang: string;
  handled: boolean;
  created_at: string;
};

function toEnquiry(r: Row): Enquiry {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    message: r.message,
    pieceName: r.piece_name,
    lang: r.lang,
    handled: r.handled,
    createdAt: r.created_at,
  };
}

/** Open ones first, newest first within each group. */
export async function getEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await getSupabase()
    .from("enquiries")
    .select(COLUMNS)
    .order("handled", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as Row[]).map(toEnquiry);
}

/** Answered, or not worth answering. Either way it leaves the open list. */
export async function setEnquiryHandled(
  id: string,
  handled: boolean
): Promise<void> {
  const { error } = await getSupabase()
    .from("enquiries")
    .update({ handled })
    .eq("id", id);
  if (error) throw error;
}
