import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { fmt, formatDate } from "@/lib/utils";

// Build last N months as YYYY-MM strings
function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("pt-BR", { month: "short" }).replace(".", "") + "/" + y.slice(2);
}

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;
  const months = lastNMonths(6);
  const inicio = months[0] + "-01";

  const [{ data: receitas }, { data: despesas }, { data: pessoal }] = await Promise.all([
    supabase.from("receitas").select("data,total,cliente,tipo").eq("user_id", uid).gte("data", inicio),
    supabase.from("despesas").select("data,val,descricao,cat").eq("user_id", uid).gte("data", inicio),
    supabase.from("pessoal").select("data,val,descricao,cat").eq("user_id", uid).gte("data", inicio),
  ]);

  // Aggregate per month
  type MonthData = { receita: number; despesa: number; pessoal: number };
  const byMonth: Record<string, MonthData> = {};
  months.forEach((m) => { byMonth[m] = { receita: 0, despesa: 0, pessoal: 0 }; });

  (receitas || []).forEach((r) => {
    const ym = r.data.slice(0, 7);
    if (byMonth[ym]) byMonth[ym].receita += r.total;
  });
  (despesas || []).forEach((d) => {
    const ym = d.data.slice(0, 7);
    if (byMonth[ym]) byMonth[ym].despesa += d.val;
  });
  (pessoal || []).forEach((p) => {
    const ym = p.data.slice(0, 7);
    if (byMonth[ym]) byMonth[ym].pessoal += p.val;
  });

  // Chart data
  const chartData = months.map((m) => {
    const d = byMonth[m];
    const lucro = d.receita - d.despesa - d.pessoal;
    return { label: monthLabel(m), receita: d.receita, despesa: d.despesa + d.pessoal, lucro };
  });

  // Monthly summary rows
  const summaryRows = months.map((m) => {
    const d = byMonth[m];
    const lucro = d.receita - d.despesa - d.pessoal;
    const margem = d.receita > 0 ? ((lucro / d.receita) * 100).toFixed(1) : "0";
    return { ym: m, label: monthLabel(m), ...d, lucro, margem };
  }).reverse();

  // Recent transactions (last 3 months)
  type Entry = { id: string; data: string; tipo: "receita" | "despesa" | "pessoal"; descricao: string; cat: string; val: number };
  const tresM = months[3] + "-01";
  const entries: Entry[] = [
    ...(receitas || []).filter((r) => r.data >= tresM).map((r) => ({
      id: r.data + r.cliente, data: r.data, tipo: "receita" as const, descricao: r.cliente, cat: r.tipo, val: r.total,
    })),
    ...(despesas || []).filter((d) => d.data >= tresM).map((d) => ({
      id: d.data + d.descricao, data: d.data, tipo: "despesa" as const, descricao: d.descricao, cat: d.cat, val: d.val,
    })),
    ...(pessoal || []).filter((p) => p.data >= tresM).map((p) => ({
      id: p.data + p.descricao, data: p.data, tipo: "pessoal" as const, descricao: p.descricao, cat: p.cat, val: p.val,
    })),
  ].sort((a, b) => b.data.localeCompare(a.data));

  const typeConfig = {
    receita: { label: "Receita", color: "#4a9e6e", bg: "#4a9e6e33", sign: "+" },
    despesa: { label: "Despesa", color: "#e07060", bg: "#e0706033", sign: "−" },
    pessoal: { label: "Pessoal", color: "#6a9ad0", bg: "#6a9ad033", sign: "−" },
  };

  const totalR = summaryRows.reduce((a, r) => a + r.receita, 0);
  const totalD = summaryRows.reduce((a, r) => a + r.despesa + r.pessoal, 0);
  const totalL = totalR - totalD;

  return (
    <div>
      <PageHeader title="📋 Histórico" subtitle="Evolução dos últimos 6 meses" />

      {/* ── Monthly evolution chart ─────────────────────────── */}
      <div
        className="rounded-xl p-5 mb-5 card-hover animate-fade-in"
        style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
      >
        <h3
          className="text-base mb-4 pb-3"
          style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc", borderBottom: "1px solid #3a2c18" }}
        >
          📈 Evolução Mensal — Receita · Despesa · Lucro
        </h3>
        <MonthlyChart data={chartData} />
      </div>

      {/* ── Monthly summary table ───────────────────────────── */}
      <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid #3a2c18" }}>
        <div className="px-5 py-3" style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}>
          <span style={{ fontFamily: "Playfair Display, serif", color: "#e5b050" }}>
            📊 Resumo por Mês
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#1a1208" }}>
              {["Mês", "Receita", "Despesas", "Pessoal", "Lucro", "Margem"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "#a08868", borderBottom: "1px solid #2c2010" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.ym} className="tr-hover" style={{ borderBottom: "1px solid #2c2010" }}>
                <td className="px-4 py-2.5 font-semibold" style={{ color: "#e4d8c0" }}>{row.label}</td>
                <td className="px-4 py-2.5" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(row.receita)}</td>
                <td className="px-4 py-2.5" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>{fmt(row.despesa)}</td>
                <td className="px-4 py-2.5" style={{ color: "#6a9ad0", fontFamily: "DM Mono, monospace" }}>{fmt(row.pessoal)}</td>
                <td className="px-4 py-2.5 font-bold" style={{
                  color: row.lucro >= 0 ? "#e5b050" : "#bf4e38",
                  fontFamily: "DM Mono, monospace",
                }}>
                  {fmt(row.lucro)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: Number(row.margem) >= 20 ? "rgba(74,158,110,.2)" : "rgba(191,78,56,.2)",
                      color: Number(row.margem) >= 20 ? "#4a9e6e" : "#bf4e38",
                    }}
                  >
                    {row.margem}%
                  </span>
                </td>
              </tr>
            ))}
            {/* Totals */}
            <tr style={{ background: "#221808", borderTop: "2px solid #c8872c" }}>
              <td className="px-4 py-2.5 font-bold" style={{ color: "#e5b050" }}>Total 6m</td>
              <td className="px-4 py-2.5 font-bold" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(totalR)}</td>
              <td className="px-4 py-2.5 font-bold" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>{fmt(totalD)}</td>
              <td />
              <td className="px-4 py-2.5 font-bold" style={{ color: totalL >= 0 ? "#e5b050" : "#bf4e38", fontFamily: "DM Mono, monospace" }}>{fmt(totalL)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Recent transactions ─────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <div className="px-5 py-3" style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}>
          <span style={{ fontFamily: "Playfair Display, serif", color: "#e5b050" }}>
            🗂 Transações — últimos 3 meses
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#1a1208" }}>
              {["Data", "Tipo", "Descrição", "Categoria", "Valor"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "#a08868", borderBottom: "1px solid #2c2010" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!entries.length ? (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: "#6a5438" }}>Nenhuma transação.</td></tr>
            ) : (
              entries.map((e, i) => {
                const cfg = typeConfig[e.tipo];
                return (
                  <tr key={i} className="tr-hover" style={{ borderBottom: "1px solid #2c2010" }}>
                    <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{formatDate(e.data)}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
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
