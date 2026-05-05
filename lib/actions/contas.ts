"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addConta(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("contas").insert({
    user_id: user.id,
    cli: formData.get("cli") as string,
    val: Number(formData.get("val")),
    data: formData.get("data") as string,
    venc: formData.get("venc") as string,
    descricao: (formData.get("descricao") as string) || null,
    pago: false,
  });
  revalidatePath("/contas");
}

export async function togglePago(id: string, pago: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("contas").update({ pago }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/contas");
}

export async function deleteConta(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("contas").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/contas");
}
