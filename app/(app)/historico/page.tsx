import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmt, formatDate } from "@/lib/utils";

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;

  // Fetch last 3 months of all transaction types
  const tresM = new Date();
  tresM.setMonth(tresM.getMonth() - 3);
  const inicio = tresM.toISOString().slice(0, 10);

  const [{ data: receitas }, { data: despesas }, { data: pessoal }] = await Promise.all([
    supabase.from("receitas").select("id,data,total,cliente,tipo").eq("user_id", uid).gte("data", inicio),
    supabase.from("despesas").select("id,data,val,descricao,cat").eq("user_id", uid).gte("data", inicio),
    supabase.from("pessoal").select("id,data,val,descricao,cat").eq("user_id", uid).gte("data", inicio),
  ]);

  // Merge and sort by date desc
  type Entry = {
    id: string;
    data: string;
    tipo: "receita" | "despesa" | "pessoal";
    descricao: string;
    cat: string;
    val: number;
  };

  const entries: Entry[] = [
    ...(receitas || []).map((r) => ({
      id: r.id,
      data: r.data,
      tipo: "receita" as const,
      descricao: r.cliente,
      cat: r.tipo,
      val: r.total,
    })),
    ...(despesas || []).map((d) => ({
      id: d.id,
      data: d.data,
      tipo: "despesa" as const,
      descricao: d.descricao,
      cat: d.cat,
      val: d.val,
    })),
    ...(pessoal || []).map((p) => ({
      id: p.id,
      data: p.data,
      tipo: "pessoal" as const,
      descricao: p.descricao,
      cat: p.cat,
      val: p.val,
    })),
  ].sort((a, b) => b.data.localeCompare(a.data));

  const totalReceitas = (receitas || []).reduce((a, r) => a + r.total, 0);
  const totalDespesas = (despesas || []).reduce((a, d) => a + d.val, 0);
  const totalPessoal = (pessoal || []).reduce((a, p) => a + p.val, 0);
  const saldo = totalReceitas - totalDespesas - totalPessoal;

  const typeConfig = {
    receita: { label: "Receita", color: "#4a9e6e", bg: "#4a9e6e33", sign: "+" },
    despesa: { label: "Despesa", color: "#e07060", bg: "#e0706033", sign: "−" },
    pessoal: { label: "Pessoal", color: "#6a9ad0", bg: "#6a9ad033", sign: "−" },
  };

  return (
    <div>
      <PageHeader title="📋 Histórico" subtitle="Últimos 3 meses de transações" />

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Receitas", val: totalReceitas, color: "#4a9e6e" },
          { label: "Despesas Op.", val: totalDespesas, color: "#e07060" },
          { label: "Pessoal", val: totalPessoal, color: "#6a9ad0" },
          { label: "Saldo", val: saldo, color: saldo >= 0 ? "#e5b050" : "#bf4e38" },
        ].map(({ label, val, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <div className="text-xs mb-1" style={{ color: "#6a5438" }}>{label}</div>
            <div className="font-bold" style={{ color, fontFamily: "DM Mono, monospace" }}>{fmt(val)}</div>
          </div>
        ))}
      </div>

      {/* Transaction table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Data", "Tipo", "Descrição", "Categoria", "Valor"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold"
                  style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!entries.length ? (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: "#6a5438" }}>Nenhuma transação.</td></tr>
            ) : (
              entries.map((e) => {
                const cfg = typeConfig[e.tipo];
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid #2c2010" }}>
                    <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{formatDate(e.data)}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{e.descricao}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "#6a5438" }}>{e.cat}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: cfg.color, fontFamily: "DM Mono, monospace" }}>
                      {cfg.sign} {fmt(e.val)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
