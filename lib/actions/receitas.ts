"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addReceita(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const qtd = Number(formData.get("qtd"));
  const preco = Number(formData.get("preco"));
  await supabase.from("receitas").insert({
    user_id: user.id,
    data: formData.get("data") as string,
    cliente: formData.get("cliente") as string,
    tipo: formData.get("tipo") as string,
    qtd,
    preco,
    total: qtd * preco,
    pag: formData.get("pag") as string,
    obs: (formData.get("obs") as string) || null,
  });
  revalidatePath("/receitas");
  revalidatePath("/");
}

export async function deleteReceita(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("receitas").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/receitas");
  revalidatePath("/");
}
