import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ClienteForm } from "./ClienteForm";
import { deleteCliente } from "@/lib/actions/clientes";
import { fmt } from "@/lib/utils";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: clientes }, { data: cfg }] = await Promise.all([
    supabase.from("clientes").select("*").eq("user_id", user.id).order("nome"),
    supabase.from("config").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const tipoColor: Record<string, string> = {
    varejo: "#4a9e6e", atacado: "#4878b0", evento: "#8858a0",
  };

  const diaLabel: Record<string, string> = {
    quarta: "Quarta", sexta: "Sexta", sabado: "Sábado",
    variavel: "Variável", retirada: "Retirada",
  };

  return (
    <div>
      <PageHeader title="👥 Clientes" subtitle={`${(clientes || []).length} clientes cadastrados`} />
      <ClienteForm precoVarejo={cfg?.p_varejo ?? 6.5} />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Nome", "Tipo", "Cidade", "Tel.", "Qtd/Preço", "Entrega", "CNPJ/NF", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(clientes?.length) ? (
              <tr>
                <td colSpan={8} className="text-center py-10" style={{ color: "#6a5438" }}>
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #2c2010" }}>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>
                    <div>{c.nome}</div>
                    {c.ref && <div className="text-xs" style={{ color: "#6a5438" }}>ref: {c.ref}</div>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: (tipoColor[c.tipo] || "#a08868") + "33", color: tipoColor[c.tipo] || "#a08868" }}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{c.cidade}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{c.tel}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>
                    {c.qtd > 0 ? `${c.qtd}x ` : ""}{fmt(c.preco)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "#2c2010", color: "#e5b050" }}>
                      {diaLabel[c.dia] || c.dia}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: "#6a5438" }}>
                    {c.cnpj ? <div>{c.cnpj}</div> : null}
                    {c.nota === "sim" && <div style={{ color: "#c8872c" }}>NF sim</div>}
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={async () => { "use server"; await deleteCliente(c.id); }}>
                      <button type="submit" className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                        style={{ background: "#3a1a10", color: "#bf4e38" }}>
                        🗑
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
