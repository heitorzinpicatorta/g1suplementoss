import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
