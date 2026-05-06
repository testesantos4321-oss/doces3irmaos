import { createClient } from "@/lib/supabase/server";
import { fmt, mesAtual, inicioMes } from "@/lib/utils";
import { PrintButton } from "./PrintButton";

export default async function RelatorioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;
  const mes = mesAtual();
  const inicio = inicioMes();

  const [
    { data: receitas },
    { data: despesas },
    { data: pessoal },
    { data: fornadas },
    { data: meta },
    { data: contas },
    { data: clientes },
  ] = await Promise.all([
    supabase.from("receitas").select("*").eq("user_id", uid).gte("data", inicio).order("data"),
    supabase.from("despesas").select("*").eq("user_id", uid).gte("data", inicio).order("data"),
    supabase.from("pessoal").select("*").eq("user_id", uid).gte("data", inicio).order("data"),
    supabase.from("fornadas").select("*").eq("user_id", uid).gte("data", inicio),
    supabase.from("metas").select("*").eq("user_id", uid).eq("mes", mes).maybeSingle(),
    supabase.from("contas").select("*").eq("user_id", uid).eq("pago", false),
    supabase.from("clientes").select("nome").eq("user_id", uid),
  ]);

  const tR = (receitas || []).reduce((a, r) => a + r.total, 0);
  const tD = (despesas || []).reduce((a, d) => a + d.val, 0);
  const tP = (pessoal || []).reduce((a, p) => a + p.val, 0);
  const lucro = tR - tD - tP;
  const margem = tR > 0 ? ((lucro / tR) * 100).toFixed(1) : "0";
  const metaPct = meta ? Math.min((tR / meta.rec) * 100, 100).toFixed(0) : null;
  const totalPotes = (fornadas || []).reduce((a, f) => a + f.qtd, 0);
  const totalContas = (contas || []).reduce((a, c) => a + c.val, 0);

  // Revenue per client
  const revenueMap: Record<string, number> = {};
  (receitas || []).forEach((r) => {
    if (r.cliente) revenueMap[r.cliente] = (revenueMap[r.cliente] || 0) + r.total;
  });
  const rankList = Object.entries(revenueMap).sort(([, a], [, b]) => b - a).slice(0, 5);

  // Expenses by category
  const catMap: Record<string, number> = {};
  (despesas || []).forEach((d) => {
    catMap[d.cat] = (catMap[d.cat] || 0) + d.val;
  });

  const geradoEm = new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      {/* Screen-only header */}
      <div className="mb-6 flex items-center justify-between no-print">
        <div>
          <h1 style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", fontSize: "1.4em" }}>
            📄 Relatório Mensal
          </h1>
          <p className="text-sm mt-1" style={{ color: "#a08868" }}>
            {mes} · Gerado em {geradoEm}
          </p>
        </div>
        <PrintButton />
      </div>

      {/* ── Print-friendly report body ─────────────────────── */}
      <div id="report-body">

        {/* Cover */}
        <div
          className="rounded-2xl p-8 mb-6 text-center"
          style={{
            background: "linear-gradient(135deg,#1a1208,#221808)",
            border: "2px solid #c8872c",
          }}
        >
          <div style={{ fontFamily: "Pacifico, cursive", color: "#e5b050", fontSize: "2em" }}>
            Doces 3 Irmãos
          </div>
          <div className="mt-2 text-sm" style={{ color: "#a08868", fontStyle: "italic" }}>
            🙏 "Deus seja louvado" · Garanhuns, PE
          </div>
          <div
            className="mt-4 text-xl font-bold"
            style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc" }}
          >
            Relatório Mensal — {mes}
          </div>
          <div className="text-xs mt-1" style={{ color: "#6a5438" }}>Gerado em {geradoEm}</div>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Receita Bruta", val: fmt(tR), color: "#4a9e6e" },
            { label: "Despesas", val: fmt(tD + tP), color: "#e07060" },
            { label: "Lucro Líquido", val: fmt(lucro), color: "#e5b050" },
            { label: "Margem", val: `${margem}%`, color: lucro >= 0 ? "#4a9e6e" : "#bf4e38" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-4 text-center" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
              <div className="text-xs mb-1" style={{ color: "#6a5438" }}>{label}</div>
              <div className="text-xl font-bold" style={{ color, fontFamily: "DM Mono, monospace" }}>{val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Revenue breakdown */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="font-semibold mb-3 pb-2" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif", borderBottom: "1px solid #2c2010" }}>
              💚 Receitas do Mês
            </h3>
            {!(receitas?.length) ? (
              <p className="text-sm" style={{ color: "#6a5438" }}>Nenhuma receita registrada.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {["Data", "Cliente", "Tipo", "Pag.", "Total"].map((h) => (
                      <th key={h} className="text-left py-1.5 pr-2" style={{ color: "#a08868", borderBottom: "1px solid #2c2010" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receitas!.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #2c2010" }}>
                      <td className="py-1.5 pr-2" style={{ color: "#a08868" }}>{r.data.slice(5).replace("-", "/")}</td>
                      <td className="py-1.5 pr-2 font-semibold" style={{ color: "#f3e6cc" }}>{r.cliente}</td>
                      <td className="py-1.5 pr-2" style={{ color: "#6a5438" }}>{r.tipo}</td>
                      <td className="py-1.5 pr-2" style={{ color: "#6a5438" }}>{r.pag}</td>
                      <td className="py-1.5 font-bold" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(r.total)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "1px solid #c8872c" }}>
                    <td colSpan={4} className="py-2 font-bold" style={{ color: "#e4d8c0" }}>Total</td>
                    <td className="py-2 font-bold" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(tR)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Expense breakdown */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="font-semibold mb-3 pb-2" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif", borderBottom: "1px solid #2c2010" }}>
              🔴 Despesas por Categoria
            </h3>
            {Object.entries(catMap).length === 0 ? (
              <p className="text-sm" style={{ color: "#6a5438" }}>Nenhuma despesa registrada.</p>
            ) : (
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(catMap).sort(([, a], [, b]) => b - a).map(([cat, val]) => (
                    <tr key={cat} style={{ borderBottom: "1px solid #2c2010" }}>
                      <td className="py-1.5" style={{ color: "#a08868" }}>{cat}</td>
                      <td className="py-1.5 font-bold text-right" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>{fmt(val)}</td>
                    </tr>
                  ))}
                  {tP > 0 && (
                    <tr style={{ borderBottom: "1px solid #2c2010" }}>
                      <td className="py-1.5" style={{ color: "#6a9ad0" }}>Pessoal / Família</td>
                      <td className="py-1.5 font-bold text-right" style={{ color: "#6a9ad0", fontFamily: "DM Mono, monospace" }}>{fmt(tP)}</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: "1px solid #c8872c" }}>
                    <td className="py-2 font-bold" style={{ color: "#e4d8c0" }}>Total Gasto</td>
                    <td className="py-2 font-bold text-right" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>{fmt(tD + tP)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ranking + Fornadas + Contas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Client ranking */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="font-semibold mb-3 pb-2" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif", borderBottom: "1px solid #2c2010" }}>
              🏆 Top Clientes
            </h3>
            {rankList.length === 0 ? (
              <p className="text-xs" style={{ color: "#6a5438" }}>Sem dados.</p>
            ) : (
              rankList.map(([nome, val], i) => (
                <div key={nome} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #2c2010" }}>
                  <span className="text-xs" style={{ color: "#e4d8c0" }}>
                    {["🥇","🥈","🥉","4️⃣","5️⃣"][i]} {nome}
                  </span>
                  <span className="text-xs font-bold" style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{fmt(val)}</span>
                </div>
              ))
            )}
          </div>

          {/* Fornadas */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="font-semibold mb-3 pb-2" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif", borderBottom: "1px solid #2c2010" }}>
              🍯 Fornadas do Mês
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1" style={{ borderBottom: "1px solid #2c2010" }}>
                <span style={{ color: "#a08868" }}>Total de fornadas</span>
                <span style={{ color: "#e4d8c0", fontFamily: "DM Mono, monospace" }}>{(fornadas || []).length}</span>
              </div>
              <div className="flex justify-between py-1" style={{ borderBottom: "1px solid #2c2010" }}>
                <span style={{ color: "#a08868" }}>Total de potes</span>
                <span style={{ color: "#e4d8c0", fontFamily: "DM Mono, monospace" }}>{totalPotes}</span>
              </div>
              {meta && (
                <div className="flex justify-between py-1">
                  <span style={{ color: "#a08868" }}>Meta receita</span>
                  <span style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{metaPct}%</span>
                </div>
              )}
            </div>
          </div>

          {/* A receber */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="font-semibold mb-3 pb-2" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif", borderBottom: "1px solid #2c2010" }}>
              💳 A Receber
            </h3>
            {!(contas?.length) ? (
              <p className="text-xs" style={{ color: "#4a9e6e" }}>✓ Sem pendências</p>
            ) : (
              <>
                {contas.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex justify-between py-1 text-xs" style={{ borderBottom: "1px solid #2c2010" }}>
                    <span style={{ color: "#a08868" }}>{c.cli}</span>
                    <span style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{fmt(c.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 text-xs font-bold" style={{ borderTop: "1px solid #c8872c" }}>
                  <span style={{ color: "#e4d8c0" }}>Total</span>
                  <span style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{fmt(totalContas)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profit split */}
        <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
          <h3 className="font-semibold mb-4 pb-2" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif", borderBottom: "1px solid #2c2010" }}>
            📊 Distribuição do Lucro
          </h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            {[
              { label: "Antonio (90%)", val: lucro * 0.9, color: "#e5b050" },
              { label: "Júlio (10%)", val: lucro * 0.1, color: "#6a9ad0" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center p-4 rounded-xl" style={{ background: "#221808" }}>
                <div style={{ color: "#a08868" }}>{label}</div>
                <div className="text-2xl font-bold mt-2" style={{ color, fontFamily: "DM Mono, monospace" }}>{fmt(val)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4" style={{ borderTop: "1px solid #2c2010" }}>
          <div style={{ fontFamily: "Pacifico, cursive", color: "#c8872c", fontSize: "0.9em" }}>Doces 3 Irmãos</div>
          <div className="text-xs mt-1" style={{ color: "#6a5438" }}>
            🙏 "Deus seja louvado" · Sistema de Gestão · {geradoEm}
          </div>
        </div>
      </div>
    </div>
  );
}
