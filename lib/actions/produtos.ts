"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProduto(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  await supabase.from("produtos").insert({
    user_id:       user.id,
    nome:          formData.get("nome") as string,
    descricao:     (formData.get("descricao") as string) || null,
    categoria:     formData.get("categoria") as string,
    custo:         Number(formData.get("custo")) || 0,
    preco_venda:   Number(formData.get("preco_venda")) || 0,
    estoque_atual: Number(formData.get("estoque_atual")) || 0,
    estoque_min:   Number(formData.get("estoque_min")) || 0,
    unidade:       formData.get("unidade") as string,
    imagem_url:    (formData.get("imagem_url") as string) || null,
  });

  revalidatePath("/produtos");
}

export async function updateEstoque(id: string, delta: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data } = await supabase
    .from("produtos")
    .select("estoque_atual")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) return;

  await supabase
    .from("produtos")
    .update({ estoque_atual: Math.max(0, data.estoque_atual + delta) })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/produtos");
}

export async function deleteProduto(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  await supabase.from("produtos").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/produtos");
}
