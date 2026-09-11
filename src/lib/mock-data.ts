export type OrderStatus =
  | "received"
  | "in_production"
  | "ready"
  | "shipped"
  | "delivered";

export type OrderCategory =
  | "Jacket"
  | "Hoodie"
  | "Shirt"
  | "T-Shirt"
  | "Shorts"
  | "Pants"
  | "Cargo Set"
  | "Accessory";

export const ORDER_CATEGORIES: OrderCategory[] = [
  "Jacket",
  "Hoodie",
  "Shirt",
  "T-Shirt",
  "Shorts",
  "Pants",
  "Cargo Set",
  "Accessory",
];

export type ReviewStatus = "pending" | "accepted" | "denied";

export type OrderNoteAuthor = "client" | "studio";

export type OrderNote = {
  id: string;
  orderId: string;
  author: OrderNoteAuthor;
  text: string;
  photos: string[];
  createdAt: string;
};

export type Order = {
  id: string;
  piece: string;
  category: OrderCategory;
  photos: string[];
  placedOn: string;
  status: OrderStatus;
  reviewStatus: ReviewStatus;
  eta: string;
  total: string;
  notes?: string;
  updates: OrderNote[];
  /**
   * Photos the client took of the finished piece, uploaded from their own
   * account. Kept apart from `photos` (the studio's reference shots) because
   * they are the client's, and from note attachments because those are a
   * conversation, not a gallery.
   */
  wearPhotos: string[];
  /**
   * Whether the client has agreed the atelier may show `wearPhotos` publicly.
   * Off unless they have said yes, and theirs to withdraw at any time.
   */
  photoConsent: boolean;
  /** "YYYY-MM-DD" the consent was last given; empty when it never was. */
  photoConsentOn: string;
  /** "YYYY-MM-DD" the piece came back to the atelier; empty while it has not. */
  returnedOn: string;
};

// A garment the client already owns/received — a reference catalogue for the
// atelier, distinct from the order pipeline (no status/production/fitting).
export type OwnedItem = {
  id: string;
  name: string;
  category: OrderCategory;
  photos: string[];
  notes: string;
  addedOn: string;
};

export type MessageSender = "client" | "studio";

export type Message = {
  id: string;
  clientId: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
};

export type NotificationAudience = "client" | "admin";

export type NotificationKind =
  | "order_placed"
  | "order_reviewed"
  | "status_changed"
  | "order_note"
  | "message"
  /** The studio filed a photograph of something the client already owns. */
  | "wardrobe_added"
  /** Somebody asked about a piece without having an account. */
  | "enquiry";

export type Notification = {
  id: string;
  audience: NotificationAudience;
  clientId: string;
  kind: NotificationKind;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export type Measurements = {
  height: string;
  shoulders: string;
  chest: string;
  waistNatural: string;
  lowerWaist: string;
  upperArm: string;
  biceps: string;
  wrist: string;
  inseam: string;
  thigh: string;
  ankle: string;
  notes: string;
  updatedAt: string;
};

export type DeliveryInfo = {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
  updatedAt: string;
};

export type Role = "client" | "admin";

export type Client = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "client";
  orders: Order[];
  measurements: Measurements;
  delivery: DeliveryInfo;
  items: OwnedItem[];
};

export type TimeSlot = { id: string; time: string };

export type DayAvailability = {
  date: string;
  open: boolean;
  slots: TimeSlot[];
};

export type Booking = {
  id: string;
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  orderId: string;
  createdAt: string;
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "received",
  "in_production",
  "ready",
  "shipped",
  "delivered",
];

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const EMPTY_MEASUREMENTS: Measurements = {
  height: "",
  shoulders: "",
  chest: "",
  waistNatural: "",
  lowerWaist: "",
  upperArm: "",
  biceps: "",
  wrist: "",
  inseam: "",
  thigh: "",
  ankle: "",
  notes: "",
  updatedAt: "Not yet taken",
};

export const EMPTY_DELIVERY: DeliveryInfo = {
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  notes: "",
  updatedAt: "",
};
