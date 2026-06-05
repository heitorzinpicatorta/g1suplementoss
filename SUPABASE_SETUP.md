# ══════════════════════════════════════════════════════════════
#  INTEGRAÇÃO SUPABASE — Próximos Passos
# ══════════════════════════════════════════════════════════════

## 1️⃣  ADICIONAR VARIÁVEIS DE AMBIENTE

### No arquivo `.env.local` (ou `.env` em produção):

```dotenv
# ── Supabase (para o Frontend) ──────────────────────────────────
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...sua-anon-key...

# As chaves acima encontram-se em:
# Supabase Dashboard → Settings → API → URL e Key (anon/public)
```

### No arquivo `.env` da Vercel (ou via Dashboard):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...sua-anon-key...
```

---

## 2️⃣  EXECUTAR O SCHEMA SQL

Na sua base de dados Supabase:

1. Vá para: **Supabase Dashboard** → **SQL Editor**
2. Cole o conteúdo do arquivo `supabase_schema.sql`
3. Execute o script

Isso criará:
- Tabela `store_config` (para produtos, categorias, settings)
- Tabela `orders` (para pedidos)
- Índices e segurança

---

## 3️⃣  COMO FUNCIONA AGORA

### Frontend (React):
- Ao abrir `/admin`, carrega produtos, categorias e settings do Supabase
- Cada edição é salva **localmente primeiro** (rápido), depois sincroniza com Supabase (async)
- Fallback para localStorage se Supabase estiver indisponível

### Dados em Tempo Real:
- Todas as mudanças no admin são salvas na nuvem
- Qualquer dispositivo acessa os mesmos dados
- A Vercel puxa sempre os dados mais recentes

---

## 4️⃣  FLUXO DE DESENVOLVIMENTO

```
┌─────────────────────────────────────────┐
│  Admin edita produtos no /admin         │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │ Atualiza Estado │
        │   React Local   │
        └────────┬────────┘
                 │
        ┌────────▼────────────────┐
        │  Salva no localStorage  │
        │  (backup local)         │
        └────────┬────────────────┘
                 │
        ┌────────▼──────────────────────────┐
        │ Sincroniza com Supabase           │
        │ (async, não bloqueia UI)          │
        └────────┬──────────────────────────┘
                 │
        ┌────────▼────────────────────────┐
        │ Dados salvos na nuvem           │
        │ Acessível em qualquer lugar     │
        └─────────────────────────────────┘
```

---

## 5️⃣  TESTES LOCAIS

### Rodar em desenvolvimento:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001` (se houver)

### Testar se está sincronizando:

1. Abra o navegador → DevTools (F12)
2. Vá para **Console**
3. Edite um produto no `/admin`
4. Veja logs de sucesso: `"✅ Sincronizado com Supabase"`
5. Atualize a página → dados persistem (vieram do Supabase)

---

## 6️⃣  DEPLOY NA VERCEL

### 1. Adicione as variáveis de ambiente:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Ou manualmente:
- **Vercel Dashboard** → Seu projeto → **Settings** → **Environment Variables**
- Adicione as duas chaves do Supabase

### 2. Deploy:

```bash
vercel deploy --prod
```

ou simplesmente faça `git push` (se Vercel está conectado ao GitHub)

---

## 7️⃣  MONITORAR SINCRONIZAÇÃO

### Via Supabase Dashboard:

1. Vá para **Table Editor**
2. Abra tabela `store_config`
3. Veja coluna `products`, `categories`, `settings`
4. Edite no admin, veja atualizar em tempo real

### Via Logs da Vercel:

```bash
vercel logs --follow
```

Procure por: `"✅ Sincronizado com Supabase"` ou `"❌ Erro ao sincronizar"`

---

## 8️⃣  TROUBLESHOOTING

### ❌ "Erro: VITE_SUPABASE_URL não encontrado"

**Solução:** Verifique se as variáveis estão no `.env.local`

```bash
# Linux/Mac
echo $VITE_SUPABASE_URL

# Windows (PowerShell)
$env:VITE_SUPABASE_URL
```

### ❌ "Erro ao conectar ao Supabase"

1. Verifique URL e chave (copie novamente do Supabase)
2. Confirme que o schema SQL foi executado
3. Verifique conexão de internet
4. Verifique RLS (Row Level Security) na tabela `store_config`

### ✅ "Dados sincronizados, mas não aparecem no front?"

- Limpe cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página (Ctrl+R)
- Verifique DevTools → **Network** → veja requisições ao Supabase

---

## 9️⃣  ARQUIVOS MODIFICADOS

```
✅ src/lib/supabase.ts          (novo) — Funções de acesso ao Supabase
✅ src/context/StoreContext.tsx (modificado) — Agora sincroniza com Supabase
```

---

## 🔟  RESUMO DAS MUDANÇAS

| Antes | Depois |
|-------|--------|
| Dados só no seu PC (localStorage) | Dados na nuvem + localStorage como backup |
| Edições não visíveis para outros | Todos veem atualizações em tempo real |
| Sem sincronização | Sincronização automática após cada edição |
| Dados perdidos se cache apagar | Dados sempre recuperáveis do Supabase |

---

## 📋  CHECKLIST FINAL

- [ ] Variáveis de ambiente adicionadas no `.env.local`
- [ ] Schema SQL executado no Supabase
- [ ] `npm run dev` funcionando
- [ ] Edite um produto → veja sincronizar (console)
- [ ] Recarregue página → dados persistem
- [ ] Deploy na Vercel
- [ ] Variáveis adicionadas na Vercel
- [ ] Teste em produção

---

## 💡  DICAS

1. **Performance:** A sincronização é assíncrona (non-blocking), então a UI nunca trava
2. **Offline:** Se Supabase cair, localStorage mantém os dados locais
3. **Backup:** localStorage serve como backup automático
4. **Real-time:** Considere usar Supabase Realtime no futuro para atualizações em tempo real entre abas

---

**Pronto para sincronizar com a nuvem! 🚀**
