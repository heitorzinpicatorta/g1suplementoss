// api/webhook.js
// Recebe notificações do Mercado Pago e atualiza o status do pedido no Supabase
// Configure no painel do MP: Configurações → Notificações IPN/Webhooks
//   URL: https://SEU_DOMINIO/api/webhook

import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

const STATUS_MAP = {
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "cancelled",
  charged_back: "cancelled",
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // O MP envia { type: "payment", data: { id: "..." } }
  const { type, data } = req.body;

  if (type !== "payment" || !data?.id) {
    // Outros tipos de notificação (ex: merchant_order) — apenas acusar recebimento
    return res.status(200).json({ ok: true });
  }

  try {
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: data.id });

    const preferenceId = paymentData.preference_id;
    const paymentId = String(paymentData.id);
    const mpStatus = paymentData.status; // "approved" | "rejected" | ...
    const mappedStatus = STATUS_MAP[mpStatus] ?? "pending";

    const supabase = getSupabase();
    await supabase
      .from("orders")
      .update({ status: mappedStatus, payment_id: paymentId })
      .eq("preference_id", preferenceId);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook MP:", err);
    // Devolver 200 mesmo em erro para o MP não reenviar indefinidamente
    return res.status(200).json({ ok: false, error: err.message });
  }
}
