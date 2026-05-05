"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFornada(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("fornadas").insert({
    user_id: user.id,
    data: formData.get("data") as string,
    num: formData.get("num") as string,
    qtd: Number(formData.get("qtd")),
    custo: Number(formData.get("custo")),
    resp: formData.get("resp") as string,
    sabores: (formData.get("sabores") as string) || null,
    obs: (formData.get("obs") as string) || null,
  });
  revalidatePath("/fornadas");
  revalidatePath("/");
}

export async function deleteFornada(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("fornadas").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/fornadas");
  revalidatePath("/");
}
