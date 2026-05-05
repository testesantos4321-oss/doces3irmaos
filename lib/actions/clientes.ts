"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCliente(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("clientes").insert({
    user_id: user.id,
    nome: formData.get("nome") as string,
    tipo: formData.get("tipo") as string,
    cidade: formData.get("cidade") as string,
    tel: formData.get("tel") as string,
    endereco: (formData.get("endereco") as string) || null,
    qtd: Number(formData.get("qtd")) || 0,
    preco: Number(formData.get("preco")) || 6.5,
    dia: formData.get("dia") as string,
    ref: (formData.get("ref") as string) || null,
    obs: (formData.get("obs") as string) || null,
    nota: (formData.get("nota") as string) || "nao",
    cnpj: (formData.get("cnpj") as string) || null,
  });
  revalidatePath("/clientes");
  revalidatePath("/rotas");
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  await supabase.from("clientes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/clientes");
  revalidatePath("/rotas");
}
