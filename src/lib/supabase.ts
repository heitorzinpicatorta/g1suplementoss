import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload de imagem do produto para Supabase Storage
 */
export async function uploadProductImage(file: File): Promise<string> {
  try {
    // Gera um nome único para a imagem
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const filename = `${timestamp}-${random}-${file.name}`;
    const filepath = `products/${filename}`;

    // Faz upload
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filepath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Pega a URL pública
    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (err) {
    console.error("❌ Erro ao fazer upload da imagem:", err);
    throw err;
  }
}

/**
 * Fetch produtos da Supabase
 */
export async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from("store_config")
      .select("products")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return data?.products || [];
  } catch (err) {
    console.error("❌ Erro ao buscar produtos:", err);
    return [];
  }
}

/**
 * Salvar produtos na Supabase
 */
export async function saveProducts(products: any[]) {
  try {
    const { error } = await supabase
      .from("store_config")
      .update({ products })
      .eq("id", 1);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("❌ Erro ao salvar produtos:", err);
    throw err;
  }
}

/**
 * Fetch categorias da Supabase
 */
export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from("store_config")
      .select("categories")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return data?.categories || [];
  } catch (err) {
    console.error("❌ Erro ao buscar categorias:", err);
    return [];
  }
}

/**
 * Salvar categorias na Supabase
 */
export async function saveCategories(categories: string[]) {
  try {
    const { error } = await supabase
      .from("store_config")
      .update({ categories })
      .eq("id", 1);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("❌ Erro ao salvar categorias:", err);
    throw err;
  }
}

/**
 * Fetch configurações gerais da loja
 */
export async function fetchStoreSettings() {
  try {
    const { data, error } = await supabase
      .from("store_config")
      .select("settings")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return data?.settings || {};
  } catch (err) {
    console.error("❌ Erro ao buscar settings:", err);
    return {};
  }
}

/**
 * Salvar configurações gerais da loja
 */
export async function saveStoreSettings(settings: Record<string, any>) {
  try {
    const { error } = await supabase
      .from("store_config")
      .update({ settings })
      .eq("id", 1);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("❌ Erro ao salvar settings:", err);
    throw err;
  }
}
