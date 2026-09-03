import type {
  Booking,
  DeliveryInfo,
  Measurements,
  Message,
  Notification,
  Order,
  OrderCategory,
  OrderNote,
  OwnedItem,
} from "@/lib/mock-data";
import type { ReadyPiece } from "@/lib/ready-pieces";

/**
 * The seam between Postgres and the app.
 *
 * The database speaks snake_case, dates as nulls, and money as numbers; the
 * app speaks camelCase, empty strings, and "€420". Rather than teach either one
 * the other's habits, every row crosses through a function here. That keeps the
 * translation in one file instead of scattered through twenty query sites, and
 * it is why the components did not have to change shape at all.
 */

/** Postgres gives null for an unset date; the app has always used "". */
const str = (v: string | null | undefined) => v ?? "";
const arr = (v: string[] | null | undefined) => v ?? [];

export type OrderRow = {
  id: string;
  profile_id: string;
  piece: string;
  category: string;
  photos: string[] | null;
  placed_on: string;
  status: Order["status"];
  review_status: Order["reviewStatus"];
  eta: string;
  total: string;
  notes: string;
  wear_photos: string[] | null;
  photo_consent: boolean;
  photo_consent_on: string | null;
  returned_on: string | null;
  order_notes?: OrderNoteRow[];
};

export type OrderNoteRow = {
  id: string;
  order_id: string;
  author: OrderNote["author"];
  text: string;
  photos: string[] | null;
  created_at: string;
};

export function toOrderNote(r: OrderNoteRow): OrderNote {
  return {
    id: r.id,
    orderId: r.order_id,
    author: r.author,
    text: r.text,
    photos: arr(r.photos),
    createdAt: r.created_at,
  };
}

export function toOrder(r: OrderRow): Order {
  return {
    id: r.id,
    piece: r.piece,
    category: r.category as OrderCategory,
    photos: arr(r.photos),
    placedOn: r.placed_on,
    status: r.status,
    reviewStatus: r.review_status,
    eta: r.eta,
    total: r.total,
    notes: r.notes || undefined,
    updates: (r.order_notes ?? [])
      .map(toOrderNote)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    wearPhotos: arr(r.wear_photos),
    photoConsent: r.photo_consent,
    photoConsentOn: str(r.photo_consent_on),
    returnedOn: str(r.returned_on),
  };
}

export type MeasurementRow = {
  profile_id: string;
  height: string; shoulders: string; chest: string;
  waist_natural: string; lower_waist: string;
  upper_arm: string; biceps: string; wrist: string;
  inseam: string; thigh: string; ankle: string;
  notes: string; updated_at: string | null;
};

export function toMeasurements(r: MeasurementRow): Measurements {
  return {
    height: r.height, shoulders: r.shoulders, chest: r.chest,
    waistNatural: r.waist_natural, lowerWaist: r.lower_waist,
    upperArm: r.upper_arm, biceps: r.biceps, wrist: r.wrist,
    inseam: r.inseam, thigh: r.thigh, ankle: r.ankle,
    notes: r.notes,
    // "Not yet taken" is the app's own sentinel, translated at render time.
    updatedAt: r.updated_at ? r.updated_at.slice(0, 10) : "Not yet taken",
  };
}

export function fromMeasurements(m: Measurements, profileId: string): MeasurementRow {
  return {
    profile_id: profileId,
    height: m.height, shoulders: m.shoulders, chest: m.chest,
    waist_natural: m.waistNatural, lower_waist: m.lowerWaist,
    upper_arm: m.upperArm, biceps: m.biceps, wrist: m.wrist,
    inseam: m.inseam, thigh: m.thigh, ankle: m.ankle,
    notes: m.notes,
    updated_at: new Date().toISOString(),
  };
}

export type DeliveryRow = {
  profile_id: string;
  address: string; city: string; postal_code: string;
  phone: string; notes: string; updated_at: string | null;
};

export function toDelivery(r: DeliveryRow): DeliveryInfo {
  return {
    address: r.address, city: r.city, postalCode: r.postal_code,
    phone: r.phone, notes: r.notes,
    updatedAt: r.updated_at ? r.updated_at.slice(0, 10) : "",
  };
}

export function fromDelivery(d: DeliveryInfo, profileId: string): DeliveryRow {
  return {
    profile_id: profileId,
    address: d.address, city: d.city, postal_code: d.postalCode,
    phone: d.phone, notes: d.notes,
    updated_at: new Date().toISOString(),
  };
}

export type WardrobeRow = {
  id: string; profile_id: string; name: string; category: string;
  photos: string[] | null; notes: string; added_on: string;
};

export function toOwnedItem(r: WardrobeRow): OwnedItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category as OrderCategory,
    photos: arr(r.photos),
    notes: r.notes,
    addedOn: r.added_on,
  };
}

export type MessageRow = {
  id: string; profile_id: string;
  sender: Message["sender"]; text: string; created_at: string;
};

export function toMessage(r: MessageRow): Message {
  return {
    id: r.id,
    clientId: r.profile_id,
    sender: r.sender,
    text: r.text,
    createdAt: r.created_at,
  };
}

export type NotificationRow = {
  id: string; audience: Notification["audience"]; profile_id: string | null;
  kind: string; text: string; href: string; read: boolean; created_at: string;
};

export function toNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    audience: r.audience,
    clientId: str(r.profile_id),
    kind: r.kind as Notification["kind"],
    text: r.text,
    href: r.href,
    createdAt: r.created_at,
    read: r.read,
  };
}

export type ReadyPieceRow = {
  id: string; name: string; category: string; size: string;
  price: number | string; status: ReadyPiece["status"];
  photos: string[] | null; notes?: string; held_for?: string;
  from_order_id?: string | null; added_on: string; sold_on?: string | null;
};

/**
 * Also used for rows off `public_stock`, which has no notes, held_for or
 * from_order_id — those columns simply arrive undefined and floor to "".
 */
export function toReadyPiece(r: ReadyPieceRow): ReadyPiece {
  return {
    id: r.id,
    name: r.name,
    category: r.category as OrderCategory,
    size: r.size,
    price: Number(r.price) || 0,
    status: r.status,
    photos: arr(r.photos),
    notes: str(r.notes),
    addedOn: r.added_on,
    heldFor: str(r.held_for),
    soldOn: str(r.sold_on),
    fromOrderId: str(r.from_order_id),
  };
}

export type BookingRow = {
  id: string; date: string; time: string;
  profile_id: string; order_id: string | null; created_at: string;
  profiles?: { name: string } | null;
};

export function toBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    date: r.date,
    time: r.time,
    clientId: r.profile_id,
    // Only the studio's query joins the name; a client choosing a slot sees
    // which times are taken, not who took them.
    clientName: r.profiles?.name ?? "",
    orderId: str(r.order_id),
    createdAt: r.created_at,
  };
}
