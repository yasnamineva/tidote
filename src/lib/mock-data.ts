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
  | "message";

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

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin";
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

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Order Received",
  in_production: "In Production",
  ready: "Ready for Fitting",
  shipped: "Shipped",
  delivered: "Delivered",
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "received",
  "in_production",
  "ready",
  "shipped",
  "delivered",
];

export function generateOrderId(): string {
  return `TD-${Date.now().toString().slice(-6)}`;
}

export function generateMessageId(): string {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Fills in fields that may be missing on orders persisted by older versions,
// so the UI never hits undefined arrays/enums from legacy localStorage data.
export function normalizeOrder(o: Order): Order {
  return {
    ...o,
    category: o.category ?? "Accessory",
    photos: o.photos ?? [],
    status: o.status ?? "received",
    reviewStatus: o.reviewStatus ?? "accepted",
    eta: o.eta ?? "",
    total: o.total ?? "",
    updates: o.updates ?? [],
  };
}

/**
 * Stored orders are snapshots taken when the studio last edited one, so they can
 * lag behind the seed data (e.g. missing reference photos added later). Studio
 * edits still win; the seed only fills gaps.
 */
export function mergeOrdersWithSeed(stored: Order[], seed: Order[]): Order[] {
  return stored.map((o) => {
    const base = seed.find((s) => s.id === o.id);
    if (!base) return normalizeOrder(o);
    return normalizeOrder({
      ...o,
      photos: o.photos?.length ? o.photos : base.photos,
      piece: o.piece || base.piece,
      category: o.category ?? base.category,
    });
  });
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

export const EMPTY_ITEMS: OwnedItem[] = [];

export const ADMIN: AdminAccount = {
  id: "admin",
  name: "Atelier Studio",
  email: "admin@tidote.atelier",
  password: "atelier",
  role: "admin",
};

export const CLIENTS: Client[] = [
  {
    id: "dimitar",
    name: "Dimitar Kolev",
    email: "demo@tidote.atelier",
    password: "antidote",
    role: "client",
    orders: [
      {
        id: "TD-1042",
        piece: "Burgundy Track Jacket",
        category: "Jacket",
        photos: ["/photos/gallery-2.jpg"],
        placedOn: "2026-06-02",
        status: "in_production",
        reviewStatus: "accepted",
        eta: "2026-07-28",
        total: "€420",
        notes: "Burgundy panelling, custom shoulder taping.",
        updates: [],
      },
      {
        id: "TD-1031",
        piece: "Olive Cargo Set",
        category: "Cargo Set",
        photos: ["/photos/gallery-4.jpg"],
        placedOn: "2026-05-11",
        status: "delivered",
        reviewStatus: "accepted",
        eta: "2026-05-30",
        total: "€310",
        updates: [],
      },
      {
        id: "TD-1058",
        piece: "Black Puffer Jacket",
        category: "Jacket",
        photos: ["/photos/men-1.jpg"],
        placedOn: "2026-07-10",
        status: "received",
        reviewStatus: "accepted",
        eta: "2026-08-14",
        total: "€260",
        notes: "Waiting on fabric confirmation.",
        updates: [],
      },
      {
        id: "TD-1065",
        piece: "Gold Graphic Hoodie",
        category: "Hoodie",
        photos: ["/photos/casual-5.jpg"],
        placedOn: "2026-06-20",
        status: "ready",
        reviewStatus: "accepted",
        eta: "2026-07-30",
        total: "€290",
        notes: "Fabric arrived — book your fitting whenever works for you.",
        updates: [],
      },
    ],
    measurements: {
      height: "178",
      shoulders: "46",
      chest: "98",
      waistNatural: "82",
      lowerWaist: "86",
      upperArm: "34",
      biceps: "33",
      wrist: "17",
      inseam: "80",
      thigh: "56",
      ankle: "24",
      notes: "Prefers slightly oversized fit through the shoulder.",
      updatedAt: "2026-06-02",
    },
    delivery: EMPTY_DELIVERY,
    items: [
      {
        id: "item-dimitar-1",
        name: "Denim Sherpa Jacket",
        category: "Jacket",
        photos: ["/photos/gallery-6.jpg"],
        notes: "Store-bought — like the collar and the boxy cut.",
        addedOn: "2026-05-20",
      },
      {
        id: "item-dimitar-2",
        name: "Tan Wide-Leg Pants",
        category: "Pants",
        photos: ["/photos/gallery-5.jpg"],
        notes: "Reference for my usual leg opening.",
        addedOn: "2026-05-20",
      },
    ],
  },
  {
    id: "boris",
    name: "Boris Petrov",
    email: "boris@tidote.atelier",
    password: "cargo2026",
    role: "client",
    orders: [
      {
        id: "TD-1022",
        piece: "Mint Track Pants",
        category: "Pants",
        photos: ["/photos/gallery-3.jpg"],
        placedOn: "2026-06-20",
        status: "in_production",
        reviewStatus: "accepted",
        eta: "2026-08-05",
        total: "€275",
        updates: [],
      },
      {
        id: "TD-0998",
        piece: "Panelled Track Jacket",
        category: "Jacket",
        photos: ["/photos/men-2.jpg"],
        placedOn: "2026-04-02",
        status: "delivered",
        reviewStatus: "accepted",
        eta: "2026-04-25",
        total: "€230",
        updates: [],
      },
    ],
    measurements: {
      height: "185",
      shoulders: "48",
      chest: "104",
      waistNatural: "88",
      lowerWaist: "92",
      upperArm: "36",
      biceps: "36",
      wrist: "18",
      inseam: "84",
      thigh: "60",
      ankle: "25",
      notes: "Runs long in the torso.",
      updatedAt: "2026-04-15",
    },
    delivery: {
      address: "12 Vitosha Blvd, Apt 4",
      city: "Sofia",
      postalCode: "1000",
      phone: "+359 88 123 4567",
      notes: "Leave with concierge if not home.",
      updatedAt: "2026-04-20",
    },
    items: [
      {
        id: "item-boris-1",
        name: "Colour-Block Jacket",
        category: "Jacket",
        photos: ["/photos/casual-6.jpg"],
        notes: "Favourite everyday layer — reference for fit.",
        addedOn: "2026-04-10",
      },
    ],
  },
  {
    id: "kaloyan",
    name: "Kaloyan Ivanov",
    email: "kaloyan@tidote.atelier",
    password: "denim2026",
    role: "client",
    orders: [
      {
        id: "TD-1071",
        piece: "Reworked Graphic Tee",
        category: "T-Shirt",
        photos: ["/photos/gallery-7.jpg"],
        placedOn: "2026-07-18",
        status: "received",
        reviewStatus: "accepted",
        eta: "2026-08-20",
        total: "€150",
        notes: "First commission — awaiting measurements.",
        updates: [],
      },
    ],
    measurements: EMPTY_MEASUREMENTS,
    delivery: EMPTY_DELIVERY,
    items: EMPTY_ITEMS,
  },
];

/**
 * Per-date exceptions only. Ordinary days come from the weekly pattern in
 * lib/hours.ts, so there is nothing to seed here — a fresh studio already has
 * fittings open on its usual days.
 */
export const SEED_AVAILABILITY: DayAvailability[] = [];

export const SEED_BOOKINGS: Booking[] = [];

export const SEED_MESSAGES: Record<string, Message[]> = {
  dimitar: [
    {
      id: "msg-seed-dimitar-1",
      clientId: "dimitar",
      sender: "studio",
      text: "Welcome back, Dimitar! Message us here anytime about fabric, fit, or timing.",
      createdAt: "2026-06-02T09:00:00.000Z",
    },
  ],
  boris: [
    {
      id: "msg-seed-boris-1",
      clientId: "boris",
      sender: "studio",
      text: "Hi Boris — glad to have you back in the atelier. Let us know if you need anything.",
      createdAt: "2026-04-15T09:00:00.000Z",
    },
  ],
  kaloyan: [
    {
      id: "msg-seed-kaloyan-1",
      clientId: "kaloyan",
      sender: "studio",
      text: "Welcome to Tidote Atelier, Kaloyan! Feel free to ask us anything here.",
      createdAt: "2026-07-18T09:00:00.000Z",
    },
  ],
};

export const SEED_ADMIN_NOTIFICATIONS: Notification[] = [
  {
    id: "ntf-seed-admin-1",
    audience: "admin",
    clientId: "kaloyan",
    kind: "message",
    text: "Kaloyan sent you a message.",
    href: "/admin/inbox",
    createdAt: "2026-07-18T09:05:00.000Z",
    read: false,
  },
];

export const SEED_CLIENT_NOTIFICATIONS: Record<string, Notification[]> = {
  dimitar: [
    {
      id: "ntf-seed-dimitar-1",
      audience: "client",
      clientId: "dimitar",
      kind: "status_changed",
      text: "Your Gold Graphic Hoodie is ready for a fitting — book a slot.",
      href: "/dashboard/orders/TD-1065",
      createdAt: "2026-07-22T10:00:00.000Z",
      read: false,
    },
  ],
  boris: [],
  kaloyan: [],
};
