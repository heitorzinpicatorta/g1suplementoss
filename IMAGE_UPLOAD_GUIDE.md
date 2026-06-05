# 📸 UPLOAD DE IMAGENS — Guia Completo

## **PASSO 1: Criar Storage Bucket no Supabase**

### 1.1 Na Supabase Dashboard:
- Vá para **Storage**
- Clique em **"Create a new bucket"**

### 1.2 Configure:
```
Name: product-images
Public: ✅ (SIM)
```

### 1.3 Clique **Create**

---

## **PASSO 2: Configurar Policies (Permissões)**

### 2.1 No bucket `product-images`:
- Clique em **product-images**
- Vá para **Policies** (ou abra o painel de segurança)

### 2.2 Crie 2 policies:

**Policy 1 — Leitura Pública (SELECT):**
```
Name: "Public read"
Target roles: public
Operations: SELECT
USING condition: true
```

**Policy 2 — Upload Autenticado (INSERT):**
```
Name: "Authenticated upload"
Target roles: authenticated
Operations: INSERT
WITH CHECK condition: true
```

---

## **PASSO 3: Arquivos Criados**

✅ **`src/components/ImageUploader.tsx`**
- Componente React para fazer upload
- Drag-and-drop / Clique para selecionar
- Preview da imagem
- Validação (tipo, tamanho)

✅ **`src/lib/supabase.ts`** (atualizado)
- Função `uploadProductImage(file)` → retorna URL pública

---

## **PASSO 4: Integrar no Admin**

### No arquivo `src/pages/Admin.tsx`:

**1. Importe o componente:**
```tsx
import { ImageUploader } from "@/components/ImageUploader";
```

**2. No modal `EditProductModal`, substitua a parte de URL da imagem:**

**ANTES (linha ~298):**
```tsx
{inp("URL da imagem", "image", "text", "https://...")}
```

**DEPOIS:**
```tsx
<div style={{ gridColumn: "1/-1", marginBottom: "14px" }}>
  <label style={labelStyle}>IMAGEM DO PRODUTO</label>
  <ImageUploader
    currentImage={form.image}
    onImageChange={(url) => set("image", url)}
    isDark={isDark}
    border={border}
    textPrimary={textPrimary}
    textMuted={textMuted}
  />
</div>
```

**3. Faça o mesmo no modal `NewProductModal` (por volta da linha ~161)**

---

## **PASSO 5: Teste Local**

### 5.1 Rode o projeto:
```bash
npm run dev
```

### 5.2 Vá para `/admin`

### 5.3 Ao criar/editar um produto:
- Veja o campo de upload
- Clique ou arraste uma imagem
- A imagem deve fazer upload e salvar!

---

## **PASSO 6: Deploy na Vercel**

```bash
git add .
git commit -m "feat: add image upload to Supabase Storage"
git push
```

Vercel vai redeployer automaticamente.

---

## **Troubleshooting**

### ❌ "Erro ao fazer upload"

**Solução:**
1. Verifique se o bucket `product-images` foi criado
2. Verifique se as policies estão corretas
3. Verifique os logs do navegador (F12 → Console)

### ❌ "Imagem não aparece"

1. Verifique se a policy de **SELECT** está ativa
2. Tente clicar em **Verify** na policy
3. Limpe o cache do navegador

### ✅ "Funcionando!"

Se a imagem subiu e salvou, está tudo certo! 🎉

---

## **Como Funciona**

```
┌─────────────────────────────┐
│ Admin seleciona imagem      │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│ Valida (tipo, tamanho)      │
└────────────┬────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Faz upload p/ Supabase Storage          │
│ (product-images/timestamp-random.jpg)   │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────┐
│ Retorna URL pública         │
│ (https://cdn.supabase...)   │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│ Salva URL no produto        │
│ Sincroniza com Supabase     │
└─────────────────────────────┘
```

---

## **Próximas Melhorias (Opcional)**

- [ ] Recorte de imagem antes de upload
- [ ] Múltiplas imagens por produto
- [ ] Compressão automática
- [ ] Watermark

---

**Pronto para fazer upload!** 🚀
