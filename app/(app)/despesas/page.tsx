import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DespesaForm } from "./DespesaForm";
import { deleteDespesa } from "@/lib/actions/despesas";
import { fmt, formatDate, inicioMes } from "@/lib/utils";

export default async function DespesasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: despesas } = await supabase
    .from("despesas")
    .select("*")
    .eq("user_id", user.id)
    .gte("data", inicioMes())
    .order("data", { ascending: false });

  const total = (despesas || []).reduce((a, d) => a + d.val, 0);

  const catColors: Record<string, string> = {
    "Matéria-Prima": "#c8872c", Embalagens: "#4878b0", "Gás/Energia": "#d07428",
    Transporte: "#4a9e6e", Marketing: "#8858a0", Aluguel: "#bf4e38",
    Manutenção: "#2d6e48", Impostos: "#6a5438", Outros: "#a08868",
  };

  return (
    <div>
      <PageHeader title="🔴 Despesas" subtitle={`Gastos do mês · Total: ${fmt(total)}`} />
      <DespesaForm />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Data", "Categoria", "Descrição", "Fornecedor", "Valor", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(despesas?.length) ? (
              <tr>
                <td colSpan={6} className="text-center py-10" style={{ color: "#6a5438" }}>
                  Nenhuma despesa registrada este mês.
                </td>
              </tr>
            ) : (
              despesas.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #2c2010" }}>
                  <td className="px-4 py-2.5" style={{ color: "#f3e6cc" }}>{formatDate(d.data)}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: (catColors[d.cat] || "#a08868") + "33", color: catColors[d.cat] || "#a08868" }}>
                      {d.cat}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{d.descricao}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{d.forn || "—"}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>{fmt(d.val)}</td>
                  <td className="px-4 py-2.5">
                    <form action={async () => { "use server"; await deleteDespesa(d.id); }}>
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
