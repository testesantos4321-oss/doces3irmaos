"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addDespesa(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("despesas").insert({
    user_id: user.id,
    data: formData.get("data") as string,
    cat: formData.get("cat") as string,
    descricao: formData.get("descricao") as string,
    val: Number(formData.get("val")),
    forn: (formData.get("forn") as string) || null,
  });
  revalidatePath("/despesas");
  revalidatePath("/");
}

export async function deleteDespesa(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("despesas").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/despesas");
  revalidatePath("/");
}
