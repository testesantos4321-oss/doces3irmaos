import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReceitaForm } from "./ReceitaForm";
import { deleteReceita } from "@/lib/actions/receitas";
import { fmt, formatDate, inicioMes } from "@/lib/utils";

export default async function ReceitasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;
  const inicio = inicioMes();

  const [{ data: receitas }, { data: clientes }, { data: cfg }] = await Promise.all([
    supabase.from("receitas").select("*").eq("user_id", uid).gte("data", inicio).order("data", { ascending: false }),
    supabase.from("clientes").select("*").eq("user_id", uid).order("nome"),
    supabase.from("config").select("*").eq("user_id", uid).maybeSingle(),
  ]);

  const total = (receitas || []).reduce((a, r) => a + r.total, 0);

  const tipoBadge: Record<string, string> = {
    varejo: "#4a9e6e",
    varejo_desc: "#2d6e48",
    atacado: "#4878b0",
    evento: "#8858a0",
  };

  const pagBadge: Record<string, string> = {
    pix: "#c8872c",
    dinheiro: "#4a9e6e",
    cartao: "#4878b0",
    prazo: "#bf4e38",
  };

  return (
    <div>
      <PageHeader title="💚 Receitas" subtitle={`Vendas do mês · Total: ${fmt(total)}`} />
      <ReceitaForm clientes={clientes || []} cfg={cfg} />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Data", "Cliente", "Canal", "Qtd", "Preço", "Total", "Pag.", "Obs.", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(receitas?.length) ? (
              <tr>
                <td colSpan={9} className="text-center py-10" style={{ color: "#6a5438" }}>
                  Nenhuma venda registrada este mês.
                </td>
              </tr>
            ) : (
              receitas.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #2c2010" }}>
                  <td className="px-4 py-2.5" style={{ color: "#f3e6cc" }}>{formatDate(r.data)}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{r.cliente}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: tipoBadge[r.tipo] + "33", color: tipoBadge[r.tipo] }}
                    >
                      {r.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{r.qtd}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{fmt(r.preco)}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{fmt(r.total)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: pagBadge[r.pag] + "33", color: pagBadge[r.pag] }}
                    >
                      {r.pag}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 max-w-[120px] truncate" style={{ color: "#a08868" }}>{r.obs || "—"}</td>
                  <td className="px-4 py-2.5">
                    <form action={async () => { "use server"; await deleteReceita(r.id); }}>
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                        style={{ background: "#3a1a10", color: "#bf4e38" }}
                      >
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
