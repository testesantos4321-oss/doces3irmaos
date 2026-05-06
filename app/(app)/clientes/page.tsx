import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ClienteForm } from "./ClienteForm";
import { deleteCliente } from "@/lib/actions/clientes";
import { fmt, today } from "@/lib/utils";
import { WhatsAppMenu } from "@/components/shared/WhatsAppMenu";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: clientes }, { data: cfg }, { data: contas }, { data: receitas }] = await Promise.all([
    supabase.from("clientes").select("*").eq("user_id", user.id).order("nome"),
    supabase.from("config").select("*").eq("user_id", user.id).maybeSingle(),
    // Pending accounts to detect overdue per client
    supabase.from("contas").select("*").eq("user_id", user.id).eq("pago", false),
    // Revenue per client for ranking
    supabase.from("receitas").select("cliente, total").eq("user_id", user.id),
  ]);

  // Build revenue ranking map: cliente name → total
  const revenueMap: Record<string, number> = {};
  (receitas || []).forEach((r) => {
    if (r.cliente) revenueMap[r.cliente] = (revenueMap[r.cliente] || 0) + r.total;
  });

  // Build overdue map: cliente name → nearest conta
  const contaMap: Record<string, { val: number; venc: string; desc?: string }> = {};
  (contas || []).forEach((c) => {
    const existing = contaMap[c.cli];
    if (!existing || c.venc < existing.venc) {
      contaMap[c.cli] = { val: c.val, venc: c.venc, desc: c.desc };
    }
  });

  const tipoColor: Record<string, string> = {
    varejo: "#4a9e6e", atacado: "#4878b0", evento: "#8858a0",
  };

  const diaLabel: Record<string, string> = {
    quarta: "Quarta", sexta: "Sexta", sabado: "Sábado",
    variavel: "Variável", retirada: "Retirada",
  };

  // Sort clients: overdue first, then by revenue desc
  const tdHoje = today();
  const sorted = [...(clientes || [])].sort((a, b) => {
    const aOverdue = contaMap[a.nome] && contaMap[a.nome].venc <= tdHoje ? 1 : 0;
    const bOverdue = contaMap[b.nome] && contaMap[b.nome].venc <= tdHoje ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;
    return (revenueMap[b.nome] || 0) - (revenueMap[a.nome] || 0);
  });

  // Top 5 by revenue for ranking panel
  const rankList = Object.entries(revenueMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxRevenue = rankList[0]?.[1] || 1;

  return (
    <div>
      <PageHeader
        title="👥 Clientes"
        subtitle={`${(clientes || []).length} clientes · ${Object.keys(revenueMap).length} com histórico`}
      />
      <ClienteForm precoVarejo={cfg?.p_varejo ?? 6.5} />

      {/* ── Ranking panel ───────────────────────────────────── */}
      {rankList.length > 0 && (
        <div
          className="rounded-xl p-5 mb-5 card-hover animate-fade-in"
          style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", fontSize: "1em" }}>
              🏆 Ranking de Clientes
            </span>
            <span className="text-xs ml-auto" style={{ color: "#6a5438" }}>por faturamento total</span>
          </div>

          <div className="space-y-2.5">
            {rankList.map(([nome, total], idx) => {
              const pct = Math.round((total / maxRevenue) * 100);
              const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
              const barColor = idx === 0
                ? "linear-gradient(90deg,#c8872c,#f4ce7a)"
                : idx === 1
                ? "linear-gradient(90deg,#a0a0b0,#d0d0e0)"
                : idx === 2
                ? "linear-gradient(90deg,#a06830,#d09060)"
                : "linear-gradient(90deg,#4878b0,#6a9ad0)";

              return (
                <div key={nome} className="flex items-center gap-3">
                  <span className="text-sm w-6 text-center shrink-0">{medals[idx]}</span>
                  <span className="text-sm w-36 truncate shrink-0" style={{ color: "#e4d8c0" }}>{nome}</span>
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "#2c2010" }}>
                    <div
                      className="h-full rounded-full progress-fill"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <span
                    className="text-xs w-24 text-right shrink-0"
                    style={{ fontFamily: "DM Mono, monospace", color: "#e5b050" }}
                  >
                    {fmt(total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Clients table ────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Nome", "Tipo", "Cidade", "Qtd/Preço", "Entrega", "Situação", ""].map((h) => (
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
            {!sorted.length ? (
              <tr>
                <td colSpan={7} className="text-center py-10" style={{ color: "#6a5438" }}>
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              sorted.map((c) => {
                const conta = contaMap[c.nome];
                const receita = revenueMap[c.nome] || 0;
                const isOverdue = conta && conta.venc <= tdHoje;
                const isUpcoming = conta && conta.venc > tdHoje;

                return (
                  <tr
                    key={c.id}
                    className="tr-hover animate-fade-in"
                    style={{
                      borderBottom: "1px solid #2c2010",
                      borderLeft: isOverdue
                        ? "3px solid #bf4e38"
                        : isUpcoming
                        ? "3px solid #d07428"
                        : "3px solid transparent",
                    }}
                  >
                    {/* Name + revenue badge */}
                    <td className="px-4 py-2.5">
                      <div className="font-semibold" style={{ color: "#f3e6cc" }}>{c.nome}</div>
                      {receita > 0 && (
                        <div className="text-[10px] mt-0.5" style={{ color: "#6a5438", fontFamily: "DM Mono, monospace" }}>
                          💰 {fmt(receita)} total
                        </div>
                      )}
                      {c.ref && (
                        <div className="text-xs" style={{ color: "#503c20" }}>ref: {c.ref}</div>
                      )}
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          background: (tipoColor[c.tipo] || "#a08868") + "33",
                          color: tipoColor[c.tipo] || "#a08868",
                        }}
                      >
                        {c.tipo}
                      </span>
                    </td>

                    {/* City */}
                    <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{c.cidade}</td>

                    {/* Qty / Price */}
                    <td
                      className="px-4 py-2.5"
                      style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}
                    >
                      {c.qtd > 0 ? `${c.qtd}x ` : ""}{fmt(c.preco)}
                    </td>

                    {/* Delivery day */}
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "#2c2010", color: "#e5b050" }}
                      >
                        {diaLabel[c.dia] || c.dia}
                      </span>
                    </td>

                    {/* Status: overdue / upcoming / ok */}
                    <td className="px-4 py-2.5">
                      {isOverdue ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(191,78,56,.2)", color: "#bf4e38" }}
                        >
                          ⚠️ Vencida {fmt(conta.val)}
                        </span>
                      ) : isUpcoming ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(208,116,40,.2)", color: "#d07428" }}
                        >
                          🔔 Vence em breve
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "#3a5c3a" }}>✓ Em dia</span>
                      )}
                    </td>

                    {/* Actions: WhatsApp + delete */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {c.tel && (
                          <WhatsAppMenu
                            cliente={{
                              nome: c.nome,
                              tel: c.tel,
                              tipo: c.tipo,
                              qtd: c.qtd,
                              preco: c.preco,
                              dia: c.dia,
                              cidade: c.cidade,
                            }}
                            contaVencendo={conta}
                          />
                        )}
                        <form action={async () => { "use server"; await deleteCliente(c.id); }}>
                          <button
                            type="submit"
                            className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                            style={{ background: "#3a1a10", color: "#bf4e38" }}
                          >
                            🗑
                          </button>
                        </form>
                      </div>
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
