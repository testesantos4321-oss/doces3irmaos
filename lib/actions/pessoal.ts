"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPessoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("pessoal").insert({
    user_id: user.id,
    data: formData.get("data") as string,
    cat: formData.get("cat") as string,
    descricao: formData.get("descricao") as string,
    val: Number(formData.get("val")),
  });
  revalidatePath("/pessoal");
  revalidatePath("/");
}

export async function deletePessoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("pessoal").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/pessoal");
}
