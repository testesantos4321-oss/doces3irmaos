import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PessoalForm } from "./PessoalForm";
import { deletePessoal } from "@/lib/actions/pessoal";
import { fmt, formatDate, inicioMes } from "@/lib/utils";

export default async function PessoalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: pessoal } = await supabase
    .from("pessoal")
    .select("*")
    .eq("user_id", user.id)
    .gte("data", inicioMes())
    .order("data", { ascending: false });

  const total = (pessoal || []).reduce((a, p) => a + p.val, 0);

  // Group by category for summary
  const catTotals: Record<string, number> = {};
  (pessoal || []).forEach((p) => { catTotals[p.cat] = (catTotals[p.cat] || 0) + p.val; });

  return (
    <div>
      <PageHeader title="👨‍👩‍👧 Pessoal / Família" subtitle={`Gastos do mês · Total: ${fmt(total)}`} />

      {/* Category summary */}
      {Object.keys(catTotals).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(catTotals).sort(([, a], [, b]) => b - a).map(([cat, val]) => (
            <div key={cat} className="rounded-xl p-3" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
              <div className="text-xs mb-1" style={{ color: "#6a5438" }}>{cat}</div>
              <div className="font-bold" style={{ color: "#4878b0", fontFamily: "DM Mono, monospace" }}>{fmt(val)}</div>
              <div className="text-xs" style={{ color: "#6a5438" }}>
                {((val / total) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}

      <PessoalForm />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Data", "Categoria", "Descrição", "Valor", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(pessoal?.length) ? (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: "#6a5438" }}>Nenhum gasto pessoal este mês.</td></tr>
            ) : (
              pessoal.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #2c2010" }}>
                  <td className="px-4 py-2.5" style={{ color: "#f3e6cc" }}>{formatDate(p.data)}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "#4878b033", color: "#6a9ad0" }}>
                      {p.cat}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{p.descricao}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: "#4878b0", fontFamily: "DM Mono, monospace" }}>{fmt(p.val)}</td>
                  <td className="px-4 py-2.5">
                    <form action={async () => { "use server"; await deletePessoal(p.id); }}>
                      <button type="submit" className="text-xs px-2 py-1 rounded hover:opacity-80"
                        style={{ background: "#3a1a10", color: "#bf4e38" }}>🗑</button>
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
