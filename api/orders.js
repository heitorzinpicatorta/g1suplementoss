// api/orders.js
// Variáveis de ambiente necessárias:
//   SUPABASE_URL         → URL do projeto Supabase
//   SUPABASE_SERVICE_KEY → service_role key
//   JWT_SECRET           → mesma chave usada em api/login.js

import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_verifyToken.js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados");
  return createClient(url, key);
}

function rowToOrder(row) {
  return {
    id: row.id,
    date: row.created_at,
    email: row.email,
    nome: row.nome ?? undefined,
    cpf: row.cpf ?? undefined,
    address: row.address ?? undefined,
    items: row.items ?? [],
    total: row.total,
    telefone: row.telefone ?? null,
    frete: row.frete ?? null,
    status: row.status,
    preferenceId: row.preference_id ?? null,
    paymentId: row.payment_id ?? null,
  };
}

export default async function handler(req, res) {
  const supabase = getSupabase();

  // ── GET /api/orders → lista todos os pedidos (somente admin) ───────────────
  if (req.method === "GET") {
    const ok = await verifyAdmin(req);
    if (!ok) return res.status(401).json({ error: "Não autorizado" });

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data.map(rowToOrder));
  }

  // ── POST /api/orders → cria pedido (chamado pelo checkout — sem auth) ──────
  if (req.method === "POST") {
    const { email, nome, cpf, telefone, address, items, total, frete, status, preferenceId, paymentId } = req.body;

    if (!email || !items?.length || total == null) {
      return res.status(400).json({ error: "email, items e total são obrigatórios" });
    }

    const id = `G1-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        id,
        email,
        nome: nome ?? null,
        cpf: cpf ?? null,
        telefone: telefone ?? null,
        address: address ?? null,
        items,
        total,
        frete: frete ?? null,
        status: status ?? "pending",
        preference_id: preferenceId ?? null,
        payment_id: paymentId ?? null,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(rowToOrder(data));
  }

  // ── PATCH /api/orders → atualiza status/paymentId ──────────────────────────
  // Chamado tanto pelo checkout/success (sem auth) quanto pelo admin (com auth)
  // Para chamadas do admin, exige token. Para o webhook/redirect do MP, não.
  if (req.method === "PATCH") {
    const { id, preferenceId, status, paymentId } = req.body;

    if (!id && !preferenceId) {
      return res.status(400).json({ error: "id ou preferenceId é obrigatório" });
    }

    // Se vier um "id" (mudança manual de status pelo admin), exige autenticação
    if (id && !(await verifyAdmin(req))) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const updates = {};
    if (status) updates.status = status;
    if (paymentId) updates.payment_id = paymentId;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    const query = supabase.from("orders").update(updates);
    const { error } = id
      ? await query.eq("id", id)
      : await query.eq("preference_id", preferenceId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
