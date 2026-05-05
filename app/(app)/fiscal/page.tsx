import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmt, formatDate, inicioMes } from "@/lib/utils";

export default async function FiscalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const inicio = inicioMes();

  const [{ data: receitas }, { data: clientes }] = await Promise.all([
    supabase
      .from("receitas")
      .select("*")
      .eq("user_id", user.id)
      .gte("data", inicio)
      .order("data", { ascending: false }),
    supabase.from("clientes").select("*").eq("user_id", user.id).eq("nota", "sim"),
  ]);

  const clientesNF = new Set((clientes || []).map((c) => c.nome.toLowerCase()));
  const comNF = (receitas || []).filter((r) => clientesNF.has(r.cliente.toLowerCase()));
  const semNF = (receitas || []).filter((r) => !clientesNF.has(r.cliente.toLowerCase()));

  const totalComNF = comNF.reduce((a, r) => a + r.total, 0);

  return (
    <div>
      <PageHeader title="🧾 Fiscal" subtitle={`${comNF.length} vendas com NF · ${fmt(totalComNF)} tributável`} />

      {/* Alert if NF clients */}
      {clientes && clientes.length > 0 && (
        <div className="rounded-xl p-4 mb-4 flex items-start gap-3"
          style={{ background: "#1e2a1a", border: "1px solid #4a9e6e44" }}>
          <span className="text-lg mt-0.5">📋</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#4a9e6e" }}>
              Clientes que exigem Nota Fiscal:
            </p>
            <p className="text-xs mt-1" style={{ color: "#a08868" }}>
              {clientes.map((c) => `${c.nome} (${c.cnpj || "CNPJ não informado"})`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Vendas com NF */}
      {comNF.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #4a9e6e44" }}>
          <div className="px-5 py-3 flex justify-between items-center"
            style={{ background: "#1a2218", borderBottom: "1px solid #4a9e6e44" }}>
            <h3 className="font-semibold" style={{ color: "#4a9e6e", fontFamily: "Playfair Display, serif" }}>
              ✅ Vendas com Nota Fiscal ({comNF.length})
            </h3>
            <span style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace", fontWeight: 700 }}>
              {fmt(totalComNF)}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1e2218" }}>
                {["Data", "Cliente", "Canal", "Qtd", "Preço", "Total", "Pag."].map((h) => (
                  <th key={h} className="text-left px-4 py-2 font-semibold"
                    style={{ color: "#4a9e6e88", borderBottom: "1px solid #2c3828" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comNF.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #2c3828" }}>
                  <td className="px-4 py-2.5" style={{ color: "#f3e6cc" }}>{formatDate(r.data)}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{r.cliente}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{r.tipo}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{r.qtd}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{fmt(r.preco)}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(r.total)}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{r.pag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendas sem NF */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <div className="px-5 py-3 flex justify-between items-center"
          style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}>
          <h3 className="font-semibold" style={{ color: "#a08868", fontFamily: "Playfair Display, serif" }}>
            📋 Demais Vendas / Varejo ({semNF.length})
          </h3>
          <span style={{ color: "#e5b050", fontFamily: "DM Mono, monospace", fontWeight: 700 }}>
            {fmt(semNF.reduce((a, r) => a + r.total, 0))}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#1e1508" }}>
              {["Data", "Cliente", "Canal", "Qtd", "Preço", "Total", "Pag."].map((h) => (
                <th key={h} className="text-left px-4 py-2 font-semibold"
                  style={{ color: "#a08868", borderBottom: "1px solid #2c2010" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!semNF.length ? (
              <tr><td colSpan={7} className="text-center py-8" style={{ color: "#6a5438" }}>Nenhuma venda sem NF.</td></tr>
            ) : (
              semNF.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #2c2010" }}>
                  <td className="px-4 py-2.5" style={{ color: "#f3e6cc" }}>{formatDate(r.data)}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{r.cliente}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{r.tipo}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{r.qtd}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{fmt(r.preco)}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{fmt(r.total)}</td>
                  <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{r.pag}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-3" style={{ color: "#6a5438" }}>
        ⚠️ Clientes marcados como &quot;Nota Fiscal: Sim&quot; na página de Clientes aparecem automaticamente aqui.
        Consulte seu contador para emissão de NF-e.
      </p>
    </div>
  );
}
