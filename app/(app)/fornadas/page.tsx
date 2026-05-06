import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { FornadaForm } from "./FornadaForm";
import { deleteFornada } from "@/lib/actions/fornadas";
import { fmt, formatDate } from "@/lib/utils";

export default async function FornadasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: fornadas }, { data: cfg }, { data: receitas }] = await Promise.all([
    supabase.from("fornadas").select("*").eq("user_id", user.id).order("data", { ascending: false }),
    supabase.from("config").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("receitas").select("total,qtd").eq("user_id", user.id),
  ]);

  const totalPotes = (fornadas || []).reduce((a, f) => a + f.qtd, 0);
  const totalCusto = (fornadas || []).reduce((a, f) => a + f.custo, 0);

  // Cost calculator from config
  const custoPorPote = cfg
    ? (cfg.custo_leite || 0) + (cfg.custo_acucar || 0) + (cfg.custo_gas || 0) + (cfg.custo_emb || 0)
    : null;

  // Revenue per pote sold
  const totalVendido = (receitas || []).reduce((a, r) => a + r.total, 0);
  const potesVendidos = (receitas || []).reduce((a, r) => a + (r.qtd || 0), 0);
  const receitaPorPote = potesVendidos > 0 ? totalVendido / potesVendidos : null;

  const margemPorPote = custoPorPote && receitaPorPote
    ? receitaPorPote - custoPorPote
    : null;

  return (
    <div>
      <PageHeader title="🍯 Fornadas" subtitle={`${(fornadas || []).length} fornadas · ${totalPotes} potes · Custo: ${fmt(totalCusto)}`} />

      {/* ── Cost calculator panel ──────────────────────────── */}
      {custoPorPote !== null && (
        <div
          className="rounded-xl p-5 mb-5 card-hover animate-fade-in"
          style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span style={{ fontFamily: "Playfair Display, serif", color: "#e5b050" }}>
              🧮 Calculadora de Custo por Pote
            </span>
            <span className="text-xs ml-auto" style={{ color: "#6a5438" }}>
              baseado na Config
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "#221808", border: "1px solid #2c2010" }}>
              <div className="text-xs mb-1" style={{ color: "#6a5438" }}>Custo/Pote</div>
              <div className="text-xl font-bold" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>
                {fmt(custoPorPote)}
              </div>
              <div className="text-[10px] mt-1" style={{ color: "#503c20" }}>
                leite + açúcar + gás + emb.
              </div>
            </div>
            {receitaPorPote !== null && (
              <div className="rounded-xl p-4 text-center" style={{ background: "#221808", border: "1px solid #2c2010" }}>
                <div className="text-xs mb-1" style={{ color: "#6a5438" }}>Preço Médio Vendido</div>
                <div className="text-xl font-bold" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>
                  {fmt(receitaPorPote)}
                </div>
                <div className="text-[10px] mt-1" style={{ color: "#503c20" }}>
                  {potesVendidos} potes vendidos
                </div>
              </div>
            )}
            {margemPorPote !== null && (
              <div className="rounded-xl p-4 text-center" style={{ background: "#221808", border: "1px solid #2c2010" }}>
                <div className="text-xs mb-1" style={{ color: "#6a5438" }}>Lucro/Pote</div>
                <div
                  className="text-xl font-bold"
                  style={{ color: margemPorPote >= 0 ? "#e5b050" : "#bf4e38", fontFamily: "DM Mono, monospace" }}
                >
                  {fmt(margemPorPote)}
                </div>
                <div className="text-[10px] mt-1" style={{ color: "#503c20" }}>
                  {receitaPorPote && receitaPorPote > 0
                    ? `${((margemPorPote / receitaPorPote) * 100).toFixed(1)}% de margem`
                    : "—"}
                </div>
              </div>
            )}
            {totalPotes > 0 && (
              <div className="rounded-xl p-4 text-center" style={{ background: "#221808", border: "1px solid #2c2010" }}>
                <div className="text-xs mb-1" style={{ color: "#6a5438" }}>Custo Total Produzido</div>
                <div className="text-xl font-bold" style={{ color: "#c8872c", fontFamily: "DM Mono, monospace" }}>
                  {fmt(custoPorPote * totalPotes)}
                </div>
                <div className="text-[10px] mt-1" style={{ color: "#503c20" }}>
                  {totalPotes} potes × {fmt(custoPorPote)}
                </div>
              </div>
            )}
          </div>
          {!cfg?.custo_leite && (
            <p className="text-xs mt-3" style={{ color: "#6a5438" }}>
              ⚙️ Configure os custos de ingredientes em <strong style={{ color: "#c8872c" }}>Config → Custos</strong> para ver a margem real.
            </p>
          )}
        </div>
      )}

      <FornadaForm />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Nº", "Data", "Qtd Potes", "Custo Total", "Custo/Pote", "Responsável", "Sabores", "Obs.", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(fornadas?.length) ? (
              <tr>
                <td colSpan={9} className="text-center py-10" style={{ color: "#6a5438" }}>
                  Nenhuma fornada registrada.
                </td>
              </tr>
            ) : (
              fornadas.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid #2c2010" }}>
                  <td className="px-4 py-2.5 font-bold" style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{f.num}</td>
                  <td className="px-4 py-2.5" style={{ color: "#f3e6cc" }}>{formatDate(f.data)}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{f.qtd}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>{fmt(f.custo)}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>
                    {fmt(f.qtd > 0 ? f.custo / f.qtd : 0)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: "#c8872c33", color: "#c8872c" }}>
                      {f.resp}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 max-w-[140px] truncate" style={{ color: "#a08868" }}>{f.sabores || "—"}</td>
                  <td className="px-4 py-2.5 max-w-[120px] truncate" style={{ color: "#a08868" }}>{f.obs || "—"}</td>
                  <td className="px-4 py-2.5">
                    <form action={async () => { "use server"; await deleteFornada(f.id); }}>
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
