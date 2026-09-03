"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  EMPTY_DELIVERY,
  EMPTY_MEASUREMENTS,
  type DeliveryInfo,
  type Measurements,
  type Message,
  type Order,
  type OrderCategory,
  type OwnedItem,
  type Role,
} from "@/lib/mock-data";
import { getBaseClientById } from "@/lib/clients";
import { getMessages, appendMessage } from "@/lib/messages";
import { appendOrderNote } from "@/lib/admin-data";
import { pushNotification } from "@/lib/notifications-data";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { fromDelivery, fromMeasurements } from "@/lib/supabase/rows";
import { deletePhotos } from "@/lib/photos";
import { getStoredLang, pieceLabel, translate } from "@/lib/translations";

type Session = {
  name: string;
  email: string;
  role: Role;
  /** The profile id. Named clientId because that is what every caller calls it. */
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
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateMeasurements: (next: Measurements) => Promise<void>;
  updateDeliveryInfo: (next: DeliveryInfo) => Promise<void>;
  addOrder: (input: NewOrderInput) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  addOrderNote: (orderId: string, text: string, photos: string[]) => Promise<void>;
  addOrderPhotos: (orderId: string, photos: string[]) => Promise<void>;
  removeOrderPhoto: (orderId: string, index: number) => Promise<void>;
  setOrderPhotoConsent: (orderId: string, consent: boolean) => Promise<void>;
  addItem: (input: NewItemInput) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The signed-in person and their records.
 *
 * Sessions come from Supabase Auth now, not from a JSON blob in localStorage
 * that anyone could have written by hand. `onAuthStateChange` is the single
 * source of truth: it fires on load with whatever session the cookies carry, on
 * sign-in, on sign-out, and on every silent token refresh, so there is one code
 * path instead of one for hydration and another for login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [measurements, setMeasurements] = useState<Measurements>(EMPTY_MEASUREMENTS);
  const [delivery, setDelivery] = useState<DeliveryInfo>(EMPTY_DELIVERY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [items, setItems] = useState<OwnedItem[]>([]);

  const loadClientData = useCallback(async (profileId: string) => {
    const [client, thread] = await Promise.all([
      getBaseClientById(profileId),
      getMessages(profileId),
    ]);
    if (client) {
      setOrders(client.orders);
      setMeasurements(client.measurements);
      setDelivery(client.delivery);
      setItems(client.items);
    }
    setMessages(thread);
  }, []);

  useEffect(() => {
    // Without keys there is no session to find. Settle as signed-out rather
    // than throwing — this provider wraps the public pages too, and they owe
    // the database nothing.
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = getSupabase();
    let cancelled = false;

    async function hydrate(userId: string | undefined) {
      if (!userId) {
        setSession(null);
        setOrders([]);
        setMessages([]);
        setItems([]);
        setMeasurements(EMPTY_MEASUREMENTS);
        setDelivery(EMPTY_DELIVERY);
        setReady(true);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id,name,email,role")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (!profile) {
        setSession(null);
        setReady(true);
        return;
      }
      setSession({
        name: profile.name,
        email: profile.email,
        role: profile.role as Role,
        clientId: profile.id,
      });
      if (profile.role === "client") await loadClientData(profile.id);
      if (!cancelled) setReady(true);
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        // Not awaited on purpose: Supabase warns against running other calls
        // to it from inside this callback.
        void hydrate(next?.user?.id);
      }
    );

    // onAuthStateChange fires immediately with the stored session, but getUser
    // is what actually revalidates it against the server.
    supabase.auth.getUser().then(({ data }) => void hydrate(data.user?.id));

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [loadClientData]);

  const refresh = useCallback(async () => {
    if (session?.clientId && session.role === "client") {
      await loadClientData(session.clientId);
    }
  }, [session, loadClientData]);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !data.user) {
      return { ok: false, error: translate(getStoredLang(), "auth.badLogin") };
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    return { ok: true, role: (profile?.role as Role) ?? "client" };
  }, []);

  const logout = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const updateMeasurements = useCallback(
    async (next: Measurements) => {
      if (!session?.clientId) return;
      const { error } = await getSupabase()
        .from("measurements")
        .upsert(fromMeasurements(next, session.clientId));
      if (error) throw error;
      setMeasurements({
        ...next,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    },
    [session]
  );

  const updateDeliveryInfo = useCallback(
    async (next: DeliveryInfo) => {
      if (!session?.clientId) return;
      const { error } = await getSupabase()
        .from("delivery_info")
        .upsert(fromDelivery(next, session.clientId));
      if (error) throw error;
      setDelivery({ ...next, updatedAt: new Date().toISOString().slice(0, 10) });
    },
    [session]
  );

  const addOrder = useCallback(
    async (input: NewOrderInput) => {
      if (!session?.clientId) return;
      const clientId = session.clientId;
      // The order code is minted by Postgres, so two clients ordering at the
      // same second cannot collide on it.
      const { data, error } = await getSupabase()
        .from("orders")
        .insert({
          profile_id: clientId,
          piece: input.piece,
          category: input.category,
          photos: input.photos,
          status: "received",
          review_status: "pending",
          eta: "To be confirmed",
          total: "Quote pending",
          notes: input.notes ?? "",
        })
        .select("id")
        .single();
      if (error) throw error;

      const lang = getStoredLang();
      await pushNotification("admin", clientId, {
        kind: "order_placed",
        text: translate(lang, "gen.notif.orderPlaced", {
          name: session.name,
          piece: pieceLabel(lang, input.piece),
        }),
        href: `/admin/orders/${clientId}/${data.id}`,
      });
      await loadClientData(clientId);
    },
    [session, loadClientData]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session?.clientId) return;
      setMessages(await appendMessage(session.clientId, "client", text));
      await pushNotification("admin", session.clientId, {
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
    async (orderId: string, text: string, photos: string[]) => {
      if (!session?.clientId) return;
      await appendOrderNote(session.clientId, orderId, "client", text, photos);
      await loadClientData(session.clientId);
    },
    [session, loadClientData]
  );

  /** One place to change a single order of the signed-in client. */
  const patchOrder = useCallback(
    async (orderId: string, patch: Record<string, unknown>) => {
      if (!session?.clientId) return;
      const { error } = await getSupabase()
        .from("orders")
        .update(patch)
        .eq("id", orderId);
      if (error) throw error;
      await loadClientData(session.clientId);
    },
    [session, loadClientData]
  );

  const addOrderPhotos = useCallback(
    async (orderId: string, photos: string[]) => {
      const current = orders.find((o) => o.id === orderId);
      await patchOrder(orderId, {
        wear_photos: [...(current?.wearPhotos ?? []), ...photos],
      });
    },
    [orders, patchOrder]
  );

  const removeOrderPhoto = useCallback(
    async (orderId: string, index: number) => {
      const current = orders.find((o) => o.id === orderId);
      const dropped = current?.wearPhotos?.[index];
      const wearPhotos = (current?.wearPhotos ?? []).filter((_, i) => i !== index);
      await patchOrder(orderId, {
        wear_photos: wearPhotos,
        // Nothing left to permit, so the permission goes with the photos.
        photo_consent: wearPhotos.length > 0 && Boolean(current?.photoConsent),
        photo_consent_on:
          wearPhotos.length > 0 ? current?.photoConsentOn || null : null,
      });
      // Dropping the reference is not deleting the photo. Someone who asked for
      // it to be gone should not have it sitting in a bucket.
      if (dropped) await deletePhotos([dropped]);
    },
    [orders, patchOrder]
  );

  /** Consent is dated when given and wiped when withdrawn, so the record only
   *  ever says what is true right now. */
  const setOrderPhotoConsent = useCallback(
    async (orderId: string, consent: boolean) => {
      await patchOrder(orderId, {
        photo_consent: consent,
        photo_consent_on: consent ? new Date().toISOString().slice(0, 10) : null,
      });
    },
    [patchOrder]
  );

  const addItem = useCallback(
    async (input: NewItemInput) => {
      if (!session?.clientId) return;
      const { error } = await getSupabase().from("wardrobe_items").insert({
        profile_id: session.clientId,
        name: input.name,
        category: input.category,
        photos: input.photos,
        notes: input.notes ?? "",
      });
      if (error) throw error;
      await loadClientData(session.clientId);
    },
    [session, loadClientData]
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!session?.clientId) return;
      const gone = items.find((it) => it.id === id);
      const { error } = await getSupabase()
        .from("wardrobe_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      if (gone?.photos.length) await deletePhotos(gone.photos);
      await loadClientData(session.clientId);
    },
    [session, items, loadClientData]
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
        refresh,
        updateMeasurements,
        updateDeliveryInfo,
        addOrder,
        sendMessage,
        addOrderNote,
        addOrderPhotos,
        removeOrderPhoto,
        setOrderPhotoConsent,
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
