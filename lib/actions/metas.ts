"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertMeta(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("metas").upsert(
    {
      user_id: user.id,
      mes: formData.get("mes") as string,
      rec: Number(formData.get("rec")),
      potes: Number(formData.get("potes")) || 0,
      forn: Number(formData.get("forn")) || 0,
      cli: Number(formData.get("cli")) || 0,
    },
    { onConflict: "user_id,mes" }
  );
  revalidatePath("/metas");
  revalidatePath("/");
}

export async function deleteMeta(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("metas").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/metas");
}
