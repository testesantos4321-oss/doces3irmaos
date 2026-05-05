"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEvento(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("eventos").insert({
    user_id: user.id,
    nome: formData.get("nome") as string,
    data: formData.get("data") as string,
    local: (formData.get("local") as string) || null,
    plan: Number(formData.get("plan")) || 0,
    vend: Number(formData.get("vend")) || 0,
    fat: Number(formData.get("fat")) || 0,
    obs: (formData.get("obs") as string) || null,
  });
  revalidatePath("/eventos");
}

export async function deleteEvento(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("eventos").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/eventos");
}
