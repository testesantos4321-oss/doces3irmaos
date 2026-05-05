import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetaForm } from "./MetaForm";
import { deleteMeta } from "@/lib/actions/metas";
import { fmt, mesAtual, inicioMes } from "@/lib/utils";

export default async function MetasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;
  const mes = mesAtual();
  const inicio = inicioMes();

  const [{ data: metas }, { data: receitas }, { data: fornadas }, { data: clientes }] = await Promise.all([
    supabase.from("metas").select("*").eq("user_id", uid).order("mes", { ascending: false }),
    supabase.from("receitas").select("qtd,total").eq("user_id", uid).gte("data", inicio),
    supabase.from("fornadas").select("id").eq("user_id", uid),
    supabase.from("clientes").select("id").eq("user_id", uid),
  ]);

  const tR = (receitas || []).reduce((a, r) => a + r.total, 0);
  const tPotes = (receitas || []).reduce((a, r) => a + r.qtd, 0);
  const tForn = (fornadas || []).length;
  const tCli = (clientes || []).length;

  const metaMes = (metas || []).find((m) => m.mes === mes);

  function ProgressBar({ value, target, color = "#c8872c" }: { value: number; target: number; color?: string }) {
    const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-full h-2.5 overflow-hidden" style={{ background: "#2c2010" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-xs w-10 text-right" style={{ fontFamily: "DM Mono, monospace", color }}>
          {pct.toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="🎯 Metas" subtitle={`Mês atual: ${mes}`} />
      <MetaForm mesAtual={mes} />

      {/* Current month progress */}
      {metaMes && (
        <div className="rounded-xl p-5 mb-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
          <h3 className="text-base mb-4 pb-3 font-semibold" style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", borderBottom: "1px solid #3a2c18" }}>
            📊 Progresso — {mes}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "#a08868" }}>💰 Receita</span>
                <span style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>
                  {fmt(tR)} / {fmt(metaMes.rec)}
                </span>
              </div>
              <ProgressBar value={tR} target={metaMes.rec} color="#4a9e6e" />
            </div>
            {metaMes.potes > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#a08868" }}>📦 Potes</span>
                  <span style={{ color: "#c8872c", fontFamily: "DM Mono, monospace" }}>
                    {tPotes} / {metaMes.potes}
                  </span>
                </div>
                <ProgressBar value={tPotes} target={metaMes.potes} color="#c8872c" />
              </div>
            )}
            {metaMes.forn > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#a08868" }}>🍯 Fornadas</span>
                  <span style={{ color: "#d07428", fontFamily: "DM Mono, monospace" }}>
                    {tForn} / {metaMes.forn}
                  </span>
                </div>
                <ProgressBar value={tForn} target={metaMes.forn} color="#d07428" />
              </div>
            )}
            {metaMes.cli > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#a08868" }}>👥 Clientes</span>
                  <span style={{ color: "#4878b0", fontFamily: "DM Mono, monospace" }}>
                    {tCli} / {metaMes.cli}
                  </span>
                </div>
                <ProgressBar value={tCli} target={metaMes.cli} color="#4878b0" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* All metas table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Mês", "Meta Receita", "Meta Potes", "Meta Fornadas", "Meta Clientes", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(metas?.length) ? (
              <tr><td colSpan={6} className="text-center py-10" style={{ color: "#6a5438" }}>Nenhuma meta definida.</td></tr>
            ) : (
              metas.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #2c2010", background: m.mes === mes ? "#1e1808" : "transparent" }}>
                  <td className="px-4 py-2.5 font-bold" style={{ color: m.mes === mes ? "#e5b050" : "#f3e6cc", fontFamily: "DM Mono, monospace" }}>
                    {m.mes} {m.mes === mes && "←"}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(m.rec)}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{m.potes || "—"}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{m.forn || "—"}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{m.cli || "—"}</td>
                  <td className="px-4 py-2.5">
                    <form action={async () => { "use server"; await deleteMeta(m.id); }}>
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
