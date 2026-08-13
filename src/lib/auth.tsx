"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ADMIN,
  EMPTY_DELIVERY,
  EMPTY_MEASUREMENTS,
  generateId,
  generateOrderId,
  mergeOrdersWithSeed,
  type Client,
  type DeliveryInfo,
  type Measurements,
  type Message,
  type Order,
  type OrderCategory,
  type OwnedItem,
  type Role,
} from "@/lib/mock-data";
import {
  deliveryKey,
  itemsKey,
  measurementsKey,
  ordersKey,
  readJSON,
  writeJSON,
} from "@/lib/storage";
import { getBaseClientById, getBaseClients } from "@/lib/clients";
import { appendMessage, getMessages } from "@/lib/messages";
import { appendOrderNote } from "@/lib/admin-data";
import { pushNotification } from "@/lib/notifications-data";
import { getStoredLang, pieceLabel, translate } from "@/lib/translations";

const SESSION_KEY = "tidote_session";

type Session = {
  name: string;
  email: string;
  role: Role;
  clientId?: string;
};

type NewOrderInput = {
  piece: string;
  category: OrderCategory;
  notes?: string;
  photos: string[];
};

type NewItemInput = {
  name: string;
  category: OrderCategory;
  notes?: string;
  photos: string[];
};

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  orders: Order[];
  measurements: Measurements;
  delivery: DeliveryInfo;
  messages: Message[];
  items: OwnedItem[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateMeasurements: (next: Measurements) => void;
  updateDeliveryInfo: (next: DeliveryInfo) => void;
  addOrder: (input: NewOrderInput) => void;
  sendMessage: (text: string) => void;
  addOrderNote: (orderId: string, text: string, photos: string[]) => void;
  addItem: (input: NewItemInput) => void;
  removeItem: (id: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function liveClientData(client: Client) {
  return {
    orders: mergeOrdersWithSeed(
      readJSON(ordersKey(client.id), client.orders),
      client.orders
    ),
    measurements: readJSON(measurementsKey(client.id), client.measurements),
    delivery: readJSON(deliveryKey(client.id), client.delivery),
    messages: getMessages(client.id),
    items: readJSON(itemsKey(client.id), client.items),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [measurements, setMeasurements] = useState<Measurements>(
    EMPTY_MEASUREMENTS
  );
  const [delivery, setDelivery] = useState<DeliveryInfo>(EMPTY_DELIVERY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [items, setItems] = useState<OwnedItem[]>([]);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession) as Session;
      const client =
        parsed.role === "client" && parsed.clientId
          ? getBaseClientById(parsed.clientId)
          : undefined;
      if (parsed.role === "client" && !client) {
        // Stored session points at a client record that no longer exists
        // (e.g. the seed data was reshuffled) — drop it rather than render empty.
        window.localStorage.removeItem(SESSION_KEY);
      } else {
        setSession(parsed);
        if (client) {
          const live = liveClientData(client);
          setOrders(live.orders);
          setMeasurements(live.measurements);
          setDelivery(live.delivery);
          setMessages(live.messages);
          setItems(live.items);
        }
      }
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();

    if (normalized === ADMIN.email && password === ADMIN.password) {
      const next: Session = {
        name: ADMIN.name,
        email: ADMIN.email,
        role: "admin",
      };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true };
    }

    const client = getBaseClients().find(
      (c) => c.email === normalized && c.password === password
    );
    if (!client) {
      return {
        ok: false,
        error: translate(getStoredLang(), "auth.badLogin"),
      };
    }

    const next: Session = {
      name: client.name,
      email: client.email,
      role: "client",
      clientId: client.id,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    const live = liveClientData(client);
    setOrders(live.orders);
    setMeasurements(live.measurements);
    setDelivery(live.delivery);
    setMessages(live.messages);
    setItems(live.items);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const updateMeasurements = useCallback(
    (next: Measurements) => {
      if (!session?.clientId) return;
      writeJSON(measurementsKey(session.clientId), next);
      setMeasurements(next);
    },
    [session]
  );

  const updateDeliveryInfo = useCallback(
    (next: DeliveryInfo) => {
      if (!session?.clientId) return;
      writeJSON(deliveryKey(session.clientId), next);
      setDelivery(next);
    },
    [session]
  );

  const addOrder = useCallback(
    (input: NewOrderInput) => {
      if (!session?.clientId) return;
      const clientId = session.clientId;
      const order: Order = {
        id: generateOrderId(),
        piece: input.piece,
        category: input.category,
        photos: input.photos,
        placedOn: new Date().toISOString().slice(0, 10),
        status: "received",
        reviewStatus: "pending",
        eta: "To be confirmed",
        total: "Quote pending",
        notes: input.notes,
        updates: [],
      };
      setOrders((prev) => {
        const next = [order, ...prev];
        writeJSON(ordersKey(clientId), next);
        return next;
      });
      const lang = getStoredLang();
      pushNotification("admin", clientId, {
        kind: "order_placed",
        text: translate(lang, "gen.notif.orderPlaced", {
          name: session.name,
          piece: pieceLabel(lang, order.piece),
        }),
        href: `/admin/orders/${clientId}/${order.id}`,
      });
    },
    [session]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!session?.clientId) return;
      setMessages(appendMessage(session.clientId, "client", text));
      pushNotification("admin", session.clientId, {
        kind: "message",
        text: translate(getStoredLang(), "gen.notif.msgFromClient", {
          name: session.name,
        }),
        href: "/admin/inbox",
      });
    },
    [session]
  );

  const addOrderNote = useCallback(
    (orderId: string, text: string, photos: string[]) => {
      if (!session?.clientId) return;
      const updated = appendOrderNote(
        session.clientId,
        orderId,
        "client",
        text,
        photos
      );
      if (updated) setOrders(updated.orders);
    },
    [session]
  );

  const addItem = useCallback(
    (input: NewItemInput) => {
      if (!session?.clientId) return;
      const clientId = session.clientId;
      const item: OwnedItem = {
        id: generateId("item"),
        name: input.name,
        category: input.category,
        photos: input.photos,
        notes: input.notes ?? "",
        addedOn: new Date().toISOString().slice(0, 10),
      };
      setItems((prev) => {
        const next = [item, ...prev];
        writeJSON(itemsKey(clientId), next);
        return next;
      });
    },
    [session]
  );

  const removeItem = useCallback(
    (id: string) => {
      if (!session?.clientId) return;
      const clientId = session.clientId;
      setItems((prev) => {
        const next = prev.filter((it) => it.id !== id);
        writeJSON(itemsKey(clientId), next);
        return next;
      });
    },
    [session]
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        ready,
        orders,
        measurements,
        delivery,
        messages,
        items,
        login,
        logout,
        updateMeasurements,
        updateDeliveryInfo,
        addOrder,
        sendMessage,
        addOrderNote,
        addItem,
        removeItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
