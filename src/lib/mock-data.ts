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
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  sleeve: string;
  inseam: string;
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

const EMPTY_MEASUREMENTS: Measurements = {
  height: "",
  chest: "",
  waist: "",
  hips: "",
  shoulder: "",
  sleeve: "",
  inseam: "",
  notes: "",
  updatedAt: "Not yet taken",
};

const EMPTY_DELIVERY: DeliveryInfo = {
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  notes: "",
  updatedAt: "",
};

export const ADMIN: AdminAccount = {
  id: "admin",
  name: "Atelier Studio",
  email: "admin@tidote.atelier",
  password: "atelier",
  role: "admin",
};

export const CLIENTS: Client[] = [
  {
    id: "yasna",
    name: "Yasna",
    email: "demo@tidote.atelier",
    password: "antidote",
    role: "client",
    orders: [
      {
        id: "TD-1042",
        piece: "Oversized Raw-Hem Trench",
        category: "Jacket",
        photos: ["/photos/gallery-2.jpg"],
        placedOn: "2026-06-02",
        status: "in_production",
        reviewStatus: "accepted",
        eta: "2026-07-28",
        total: "€420",
        notes: "Charcoal, custom shoulder taping.",
        updates: [],
      },
      {
        id: "TD-1031",
        piece: "Deconstructed Cargo Set",
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
        piece: "Made-to-Measure Denim Jacket",
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
        piece: "Cropped Bomber",
        category: "Jacket",
        photos: ["/photos/gallery-5.jpg"],
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
      height: "170",
      chest: "88",
      waist: "68",
      hips: "94",
      shoulder: "39",
      sleeve: "58",
      inseam: "76",
      notes: "Prefers slightly oversized fit through the shoulder.",
      updatedAt: "2026-06-02",
    },
    delivery: EMPTY_DELIVERY,
  },
  {
    id: "boris",
    name: "Boris",
    email: "boris@tidote.atelier",
    password: "cargo2026",
    role: "client",
    orders: [
      {
        id: "TD-1022",
        piece: "Wide-Leg Tech Cargo",
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
      height: "181",
      chest: "98",
      waist: "82",
      hips: "100",
      shoulder: "46",
      sleeve: "64",
      inseam: "82",
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
  },
  {
    id: "elena",
    name: "Elena",
    email: "elena@tidote.atelier",
    password: "denim2026",
    role: "client",
    orders: [
      {
        id: "TD-1071",
        piece: "Reworked Shirt",
        category: "Shirt",
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
  },
];

export const SEED_AVAILABILITY: DayAvailability[] = [
  {
    date: "2026-07-28",
    open: true,
    slots: [
      { id: "s1", time: "10:00" },
      { id: "s2", time: "13:00" },
      { id: "s3", time: "15:30" },
    ],
  },
  {
    date: "2026-07-30",
    open: true,
    slots: [
      { id: "s4", time: "11:00" },
      { id: "s5", time: "14:00" },
    ],
  },
  {
    date: "2026-08-03",
    open: true,
    slots: [
      { id: "s6", time: "10:30" },
      { id: "s7", time: "12:00" },
      { id: "s8", time: "16:00" },
    ],
  },
  {
    date: "2026-08-05",
    open: false,
    slots: [],
  },
];

export const SEED_BOOKINGS: Booking[] = [];

export const SEED_MESSAGES: Record<string, Message[]> = {
  yasna: [
    {
      id: "msg-seed-yasna-1",
      clientId: "yasna",
      sender: "studio",
      text: "Welcome back, Yasna! Message us here anytime about fabric, fit, or timing.",
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
  elena: [
    {
      id: "msg-seed-elena-1",
      clientId: "elena",
      sender: "studio",
      text: "Welcome to Tidote Atelier, Elena! Feel free to ask us anything here.",
      createdAt: "2026-07-18T09:00:00.000Z",
    },
  ],
};

export const SEED_ADMIN_NOTIFICATIONS: Notification[] = [
  {
    id: "ntf-seed-admin-1",
    audience: "admin",
    clientId: "elena",
    kind: "message",
    text: "Elena sent you a message.",
    href: "/admin/inbox",
    createdAt: "2026-07-18T09:05:00.000Z",
    read: false,
  },
];

export const SEED_CLIENT_NOTIFICATIONS: Record<string, Notification[]> = {
  yasna: [
    {
      id: "ntf-seed-yasna-1",
      audience: "client",
      clientId: "yasna",
      kind: "status_changed",
      text: "Your Cropped Bomber is ready for a fitting — book a slot.",
      href: "/dashboard/orders/TD-1065",
      createdAt: "2026-07-22T10:00:00.000Z",
      read: false,
    },
  ],
  boris: [],
  elena: [],
};
