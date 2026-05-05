"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateEstoque(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("estoque").upsert(
    {
      user_id: user.id,
      item: formData.get("item") as string,
      qty: Number(formData.get("qty")),
      min_qty: Number(formData.get("min_qty")) || 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item" }
  );
  revalidatePath("/estoque");
}
