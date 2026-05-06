"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addInteracao(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("crm_interacoes").insert({
    user_id: user.id,
    cliente_nome: formData.get("cliente_nome") as string,
    tipo: formData.get("tipo") as string,
    descricao: formData.get("descricao") as string,
    data: formData.get("data") as string,
    prox_contato: (formData.get("prox_contato") as string) || null,
  });
  revalidatePath("/crm");
}

export async function deleteInteracao(id: string) {
  const supabase = await createClient();
  await supabase.from("crm_interacoes").delete().eq("id", id);
  revalidatePath("/crm");
}
