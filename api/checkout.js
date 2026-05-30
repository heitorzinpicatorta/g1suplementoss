import { MercadoPagoConfig, Preference } from "mercadopago";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preference = new Preference(mpClient);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { items, payer, address } = req.body;

  if (!items?.length) {
    return res.status(400).json({ error: "items é obrigatório" });
  }

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.title,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: "BRL",
        })),
        payer: payer
          ? {
              email: payer.email,
              first_name: payer.firstName || "",
              last_name: payer.lastName || "",
              identification: payer.cpf
                ? { type: "CPF", number: payer.cpf.replace(/\D/g, "") }
                : undefined,
              address: address
                ? {
                    zip_code: address.zip,
                    street_name: address.street,
                    street_number: address.number,
                  }
                : undefined,
            }
          : undefined,
        back_urls: {
          // CORRIGIDO: rotas que existem de fato no frontend
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        auto_return: "approved",
        payment_methods: { installments: 12 },
        statement_descriptor: "G1 Suplementos",
      },
    });

    return res.status(200).json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (err) {
    console.error("Erro ao criar preference:", err);
    return res.status(500).json({
      error: err?.message || "Erro interno ao criar checkout",
    });
  }
}
