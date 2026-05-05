"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveConfig(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("config").upsert(
    {
      user_id: user.id,
      leite: Number(formData.get("leite")),
      acucar: Number(formData.get("acucar")),
      gas: Number(formData.get("gas")),
      embalagem: Number(formData.get("embalagem")),
      conservante: Number(formData.get("conservante")),
      potes_fornada: Number(formData.get("potes_fornada")),
      p_varejo: Number(formData.get("p_varejo")),
      p_desc: Number(formData.get("p_desc")),
      p_atac: Number(formData.get("p_atac")),
      p_ev: Number(formData.get("p_ev")),
    },
    { onConflict: "user_id" }
  );
  revalidatePath("/config");
  revalidatePath("/despesas");
}
