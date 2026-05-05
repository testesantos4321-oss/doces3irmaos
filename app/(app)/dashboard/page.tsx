import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/shared/MetricCard";
import { RevenueLineChart, ExpensePieChart } from "@/components/dashboard/RevenueChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmt, today, formatDate, mesAtual, inicioMes } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;
  const mes = mesAtual();
  const inicio = inicioMes();
  const emSete = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [
    { data: receitas },
    { data: despesas },
    { data: pessoal },
    { data: fornadas },
    { data: meta },
    { data: eventos },
    { data: contas },
  ] = await Promise.all([
    supabase.from("receitas").select("*").eq("user_id", uid).gte("data", inicio),
    supabase.from("despesas").select("*").eq("user_id", uid).gte("data", inicio),
    supabase.from("pessoal").select("*").eq("user_id", uid).gte("data", inicio),
    supabase.from("fornadas").select("*").eq("user_id", uid),
    supabase
      .from("metas")
      .select("*")
      .eq("user_id", uid)
      .eq("mes", mes)
      .maybeSingle(),
    supabase
      .from("eventos")
      .select("*")
      .eq("user_id", uid)
      .gte("data", today())
      .order("data")
      .limit(3),
    supabase
      .from("contas")
      .select("*")
      .eq("user_id", uid)
      .eq("pago", false)
      .lte("venc", emSete),
  ]);

  const tR = (receitas || []).reduce((a, r) => a + r.total, 0);
  const tD = (despesas || []).reduce((a, d) => a + d.val, 0);
  const tP = (pessoal || []).reduce((a, p) => a + p.val, 0);
  const lucro = tR - tD - tP;
  const margem = tR > 0 ? ((lucro / tR) * 100).toFixed(1) : "0";

  // 7-day chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      receita: (receitas || [])
        .filter((r) => r.data === ds)
        .reduce((a, r) => a + r.total, 0),
      despesa: (despesas || [])
        .filter((d2) => d2.data === ds)
        .reduce((a, d2) => a + d2.val, 0),
    };
  });

  // Pie chart data
  const catTotals: Record<string, number> = {};
  (despesas || []).forEach((d) => {
    catTotals[d.cat] = (catTotals[d.cat] || 0) + d.val;
  });
  const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

  const metaPct = meta ? Math.min((tR / meta.rec) * 100, 100) : 0;

  // ── Reusable card wrapper ──────────────────────────────────────
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-xl p-5"
      style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
    >
      {children}
    </div>
  );

  const CardTitle = ({ text }: { text: string }) => (
    <h3
      className="text-base mb-4 pb-3"
      style={{
        fontFamily: "Playfair Display, serif",
        color: "#f3e6cc",
        borderBottom: "1px solid #3a2c18",
      }}
    >
      {text}
    </h3>
  );

  const SummaryRow = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: string;
    color?: string;
  }) => (
    <div
      className="flex justify-between py-2"
      style={{ borderBottom: "1px solid #3a2c18" }}
    >
      <span className="text-sm" style={{ color: "#a08868" }}>
        {label}
      </span>
      <span
        className="font-semibold text-sm"
        style={{ fontFamily: "DM Mono, monospace", color: color || "#f3e6cc" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Visão do mês · ${mes}`} />

      {/* ── Metric cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        <MetricCard icon="💚" label="Receita Bruta" value={fmt(tR)} sub="Total vendas" color="green" />
        <MetricCard icon="🔴" label="Despesas Op." value={fmt(tD)} sub="Custos negócio" color="red" />
        <MetricCard icon="👨‍👩‍👧" label="Pessoal" value={fmt(tP)} sub="Gastos família" color="blue" />
        <MetricCard icon="🍯" label="Lucro Líquido" value={fmt(lucro)} sub={`Margem ${margem}%`} color="gold" />
        <MetricCard icon="📦" label="Fornadas" value={String((fornadas || []).length)} sub="Registradas" color="purple" />
      </div>

      {/* ── Top row: profit split + line chart ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardTitle text="📈 Distribuição do Lucro" />
          {[
            { label: "Antonio (90%)", val: lucro * 0.9, color: "#e5b050", pct: 90 },
            { label: "Júlio (10%)",   val: lucro * 0.1, color: "#6a9ad0", pct: 10 },
          ].map(({ label, val, color, pct }) => (
            <div key={label} className="flex items-center gap-3 mb-3">
              <span className="text-sm w-28" style={{ color: "#a08868" }}>{label}</span>
              <div className="flex-1 rounded-full h-2" style={{ background: "#2c2010" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span
                className="text-sm w-24 text-right"
                style={{ fontFamily: "DM Mono, monospace", color }}
              >
                {fmt(val)}
              </span>
            </div>
          ))}
          <div className="mt-2">
            <SummaryRow label="Receita"      value={fmt(tR)}          color="#4a9e6e" />
            <SummaryRow label="Despesas"     value={"- " + fmt(tD)}   color="#e07060" />
            <SummaryRow label="Pessoal"      value={"- " + fmt(tP)}   color="#e07060" />
            <div
              className="flex justify-between py-2.5 mt-1"
              style={{ borderTop: "2px solid #c8872c" }}
            >
              <span className="text-sm font-semibold" style={{ color: "#e4d8c0" }}>
                Lucro líquido
              </span>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "DM Mono, monospace", color: "#e5b050" }}
              >
                {fmt(lucro)}
              </span>
            </div>
          </div>
          {meta && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #3a2c18" }}>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: "#a08868" }}>
                <span>🎯 Meta: {fmt(tR)} / {fmt(meta.rec)}</span>
                <span style={{ color: "#e5b050", fontFamily: "DM Mono, monospace", fontWeight: 600 }}>
                  {metaPct.toFixed(0)}%
                </span>
              </div>
              <div className="rounded-full h-2.5 overflow-hidden" style={{ background: "#2c2010" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${metaPct}%`,
                    background: "linear-gradient(90deg,#c8872c,#e5b050)",
                  }}
                />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle text="📊 Receita vs Despesa (7 dias)" />
          <RevenueLineChart data={chartData} />
        </Card>
      </div>

      {/* ── Bottom row: pie + events + bills ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardTitle text="🥧 Composição Despesas" />
          <ExpensePieChart data={pieData} />
        </Card>

        <Card>
          <CardTitle text="📅 Próximos Eventos" />
          {!(eventos?.length) ? (
            <p className="text-sm" style={{ color: "#6a5438" }}>
              Nenhum evento próximo.
            </p>
          ) : (
            eventos.map((e) => {
              const d = new Date(e.data + "T00:00:00");
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 mb-3 pb-3"
                  style={{ borderBottom: "1px solid #3a2c18" }}
                >
                  <div
                    className="rounded-lg px-2 py-1.5 text-center min-w-[44px]"
                    style={{
                      background: "linear-gradient(135deg,#c8872c,#e5b050)",
                      color: "#1a0800",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 700,
                        fontSize: "1.3em",
                        lineHeight: 1,
                      }}
                    >
                      {d.getDate()}
                    </div>
                    <div
                      style={{
                        fontSize: "0.55em",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {d.toLocaleString("pt-BR", { month: "short" })}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#f3e6cc" }}>
                      {e.nome}
                    </div>
                    <div className="text-xs" style={{ color: "#a08868" }}>
                      {e.local || "Local a definir"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <CardTitle text="⚠️ Contas Vencendo (7 dias)" />
          {!(contas?.length) ? (
            <p className="text-sm" style={{ color: "#6a5438" }}>
              Nenhuma conta vencendo em breve.
            </p>
          ) : (
            contas.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center mb-2 pb-2 pl-2"
                style={{
                  borderBottom: "1px solid #3a2c18",
                  borderLeft: `2px solid ${c.venc < today() ? "#bf4e38" : "#d07428"}`,
                }}
              >
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#f3e6cc" }}>
                    {c.cli}
                  </div>
                  <div className="text-xs" style={{ color: "#a08868" }}>
                    Venc: {formatDate(c.venc)}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "DM Mono, monospace",
                    color: "#e5b050",
                    fontSize: "0.87em",
                    fontWeight: 600,
                  }}
                >
                  {fmt(c.val)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
