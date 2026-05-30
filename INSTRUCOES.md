# G1 Suplementos — Pedidos com Supabase

Guia passo a passo para que os pedidos fiquem visíveis no `/admin`
independente de onde a compra foi feita.

---

## 1. Criar conta no Supabase (grátis)

1. Acesse https://supabase.com e crie uma conta
2. Clique em **New project**, dê um nome (ex: `g1-suplementos`) e escolha a região **South America (São Paulo)**
3. Aguarde o projeto subir (~1 min)

---

## 2. Criar a tabela de pedidos

1. No painel do Supabase, vá em **SQL Editor → New query**
2. Cole o conteúdo de `supabase_schema.sql` e clique **Run**
3. Pronto — a tabela `orders` está criada com segurança

---

## 3. Pegar as chaves do Supabase

1. No painel, vá em **Settings → API**
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** (em "Project API keys") → `SUPABASE_SERVICE_KEY`
   - ⚠️ Use a `service_role`, não a `anon` key

---

## 4. Configurar variáveis na Vercel

1. Abra seu projeto na Vercel → **Settings → Environment Variables**
2. Adicione:
   | Nome | Valor |
   |------|-------|
   | `SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | `eyJhbGc...` |
3. Clique **Save** e depois **Redeploy**

---

## 5. Instalar o pacote do Supabase

No terminal do seu projeto:

```bash
npm install @supabase/supabase-js
```

---

## 6. Substituir os arquivos

Copie os arquivos desta pasta para o seu projeto:

| Arquivo daqui | Destino no projeto |
|---|---|
| `src/context/OrdersContext.tsx` | `src/context/OrdersContext.tsx` |
| `api/orders.js` | `api/orders.js` |
| `api/webhook.js` | `api/webhook.js` |

O `CheckoutModal.tsx` e `CheckoutSuccess.tsx` **não precisam de alteração** —
a assinatura do `OrdersContext` é idêntica, só a implementação mudou.

---

## 7. Corrigir as back_urls do Mercado Pago

Em `api/checkout.js`, mude:

```js
// ANTES (errado)
back_urls: {
  success: `${baseUrl}/success`,
  failure: `${baseUrl}/failure`,
  pending: `${baseUrl}/pending`,
},

// DEPOIS (correto)
back_urls: {
  success: `${baseUrl}/checkout/success`,
  failure: `${baseUrl}/checkout/failure`,
  pending: `${baseUrl}/checkout/pending`,
},
```

---

## 8. Configurar Webhook no Mercado Pago (opcional mas recomendado)

O webhook atualiza o status do pedido automaticamente quando o pagamento é
confirmado — mesmo que o cliente feche o navegador antes de ser redirecionado.

1. Acesse https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação → **Webhooks**
3. Adicione a URL: `https://SEU_DOMINIO/api/webhook`
4. Marque o evento **Pagamentos**
5. Salve

---

## Como funciona agora

```
Cliente compra (qualquer lugar)
       ↓
CheckoutModal chama POST /api/orders  →  salva no Supabase (status: pending)
       ↓
Redireciona para o Mercado Pago
       ↓
Pagamento aprovado → MP chama POST /api/webhook  →  atualiza status no Supabase
       ↓
Cliente volta para /checkout/success  →  também atualiza via PATCH /api/orders
       ↓
Admin abre /admin → GET /api/orders  →  vê TODOS os pedidos do banco
```
