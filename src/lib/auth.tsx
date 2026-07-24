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
  CLIENTS,
  generateOrderId,
  type Client,
  type DeliveryInfo,
  type Measurements,
  type Message,
  type Order,
  type OrderCategory,
  type Role,
} from "@/lib/mock-data";
import {
  deliveryKey,
  measurementsKey,
  ordersKey,
  readJSON,
  writeJSON,
} from "@/lib/storage";
import { appendMessage, getMessages } from "@/lib/messages";
import { appendOrderNote } from "@/lib/admin-data";
import { pushNotification } from "@/lib/notifications-data";

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

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  orders: Order[];
  measurements: Measurements;
  delivery: DeliveryInfo;
  messages: Message[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateMeasurements: (next: Measurements) => void;
  updateDeliveryInfo: (next: DeliveryInfo) => void;
  addOrder: (input: NewOrderInput) => void;
  sendMessage: (text: string) => void;
  addOrderNote: (orderId: string, text: string, photos: string[]) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function liveClientData(client: Client) {
  return {
    orders: readJSON(ordersKey(client.id), client.orders),
    measurements: readJSON(measurementsKey(client.id), client.measurements),
    delivery: readJSON(deliveryKey(client.id), client.delivery),
    messages: getMessages(client.id),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [measurements, setMeasurements] = useState<Measurements>(
    CLIENTS[0].measurements
  );
  const [delivery, setDelivery] = useState<DeliveryInfo>(CLIENTS[0].delivery);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession) as Session;
      setSession(parsed);
      if (parsed.role === "client" && parsed.clientId) {
        const client = CLIENTS.find((c) => c.id === parsed.clientId);
        if (client) {
          const live = liveClientData(client);
          setOrders(live.orders);
          setMeasurements(live.measurements);
          setDelivery(live.delivery);
          setMessages(live.messages);
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

    const client = CLIENTS.find(
      (c) => c.email === normalized && c.password === password
    );
    if (!client) {
      return {
        ok: false,
        error: "That email/password doesn't match our records.",
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
      pushNotification("admin", clientId, {
        kind: "order_placed",
        text: `${session.name} placed a new order: "${order.piece}".`,
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
        text: `${session.name} sent you a message.`,
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

  return (
    <AuthContext.Provider
      value={{
        session,
        ready,
        orders,
        measurements,
        delivery,
        messages,
        login,
        logout,
        updateMeasurements,
        updateDeliveryInfo,
        addOrder,
        sendMessage,
        addOrderNote,
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
