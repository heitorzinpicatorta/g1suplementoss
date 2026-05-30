import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface OrderItem {
  id: number;
  name: string;
  qty: number;
  priceTo: number;
  image?: string | null;
}

export interface OrderAddress {
  zip: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  date: string;
  email: string;
  nome?: string;
  cpf?: string;
  address?: OrderAddress;
  items: OrderItem[];
  total: number;
  telefone?: string | null;
  frete?: { label: string; valor: number; prazo?: string } | null;
  status: OrderStatus;
  preferenceId?: string | null;
  paymentId?: string | null;
}

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Omit<Order, "id" | "date">) => Promise<string>;
  updateOrderStatus: (preferenceId: string, status: OrderStatus) => Promise<void>;
  updateOrderStatusById: (id: string, status: OrderStatus) => Promise<void>;
  updatePaymentId: (preferenceId: string, paymentId: string) => Promise<void>;
  clearOrders: () => void;
  refetch: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const AUTH_KEY = "g1-admin-token";

function getToken(): string | null {
  try { return localStorage.getItem(AUTH_KEY); } catch { return null; }
}

// Monta headers com ou sem token dependendo se está disponível
function buildHeaders(withAuth = false): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (withAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // Sem token (visitante comum) — não busca pedidos do admin
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch("/api/orders", {
        headers: buildHeaders(true),
      });
      setOrders(data);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // POST não precisa de auth — é chamado no checkout pelo cliente
  const addOrder = useCallback(async (order: Omit<Order, "id" | "date">): Promise<string> => {
    const data = await apiFetch("/api/orders", {
      method: "POST",
      headers: buildHeaders(false),
      body: JSON.stringify(order),
    });
    return data.id as string;
  }, []);

  // PATCH por preferenceId — vem do redirect do MP, sem auth
  const updateOrderStatus = useCallback(async (preferenceId: string, status: OrderStatus) => {
    await apiFetch("/api/orders", {
      method: "PATCH",
      headers: buildHeaders(false),
      body: JSON.stringify({ preferenceId, status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.preferenceId === preferenceId ? { ...o, status } : o))
    );
  }, []);

  // PATCH por id — chamado pelo admin, requer auth
  const updateOrderStatusById = useCallback(async (id: string, status: OrderStatus) => {
    await apiFetch("/api/orders", {
      method: "PATCH",
      headers: buildHeaders(true),
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const updatePaymentId = useCallback(async (preferenceId: string, paymentId: string) => {
    await apiFetch("/api/orders", {
      method: "PATCH",
      headers: buildHeaders(false),
      body: JSON.stringify({ preferenceId, paymentId }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.preferenceId === preferenceId ? { ...o, paymentId } : o))
    );
  }, []);

  const clearOrders = useCallback(() => setOrders([]), []);

  return (
    <OrdersContext.Provider
      value={{ orders, loading, addOrder, updateOrderStatus, updateOrderStatusById, updatePaymentId, clearOrders, refetch }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
