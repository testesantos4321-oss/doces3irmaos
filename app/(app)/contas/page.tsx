import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContaForm } from "./ContaForm";
import { togglePago, deleteConta } from "@/lib/actions/contas";
import { fmt, formatDate, today } from "@/lib/utils";

export default async function ContasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: contas }, { data: clientes }] = await Promise.all([
    supabase.from("contas").select("*").eq("user_id", user.id).order("venc"),
    supabase.from("clientes").select("*").eq("user_id", user.id).order("nome"),
  ]);

  const pendentes = (contas || []).filter((c) => !c.pago);
  const pagas = (contas || []).filter((c) => c.pago);
  const totalPendente = pendentes.reduce((a, c) => a + c.val, 0);
  const tdHoje = today();

  return (
    <div>
      <PageHeader title="💳 Contas a Receber" subtitle={`${pendentes.length} pendentes · ${fmt(totalPendente)} a receber`} />
      <ContaForm clientes={clientes || []} />

      {/* Pending */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #3a2c18" }}>
        <div className="px-5 py-3" style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}>
          <h3 className="font-semibold" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif" }}>
            ⏳ Pendentes ({pendentes.length})
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#1e1508" }}>
              {["Cliente", "Descrição", "Valor", "Venda", "Vencimento", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #2c2010" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!pendentes.length ? (
              <tr><td colSpan={7} className="text-center py-8" style={{ color: "#6a5438" }}>Nenhuma conta pendente! 🎉</td></tr>
            ) : (
              pendentes.map((c) => {
                const vencido = c.venc < tdHoje;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #2c2010", borderLeft: `3px solid ${vencido ? "#bf4e38" : "#d07428"}` }}>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{c.cli}</td>
                    <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{c.descricao || "—"}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>{fmt(c.val)}</td>
                    <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{formatDate(c.data)}</td>
                    <td className="px-4 py-2.5" style={{ color: vencido ? "#e07060" : "#a08868" }}>
                      {formatDate(c.venc)} {vencido && "⚠️"}
                    </td>
                    <td className="px-4 py-2.5">
                      <form action={async () => { "use server"; await togglePago(c.id, true); }}>
                        <button type="submit" className="text-xs px-3 py-1 rounded hover:opacity-80 transition-opacity font-semibold"
                          style={{ background: "#1a3020", color: "#4a9e6e", border: "1px solid #4a9e6e44" }}>
                          ✅ Recebido
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-2.5">
                      <form action={async () => { "use server"; await deleteConta(c.id); }}>
                        <button type="submit" className="text-xs px-2 py-1 rounded hover:opacity-80"
                          style={{ background: "#3a1a10", color: "#bf4e38" }}>🗑</button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paid */}
      {pagas.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2c2010" }}>
          <div className="px-5 py-3" style={{ background: "#1a1208", borderBottom: "1px solid #2c2010" }}>
            <h3 className="font-semibold" style={{ color: "#4a9e6e", fontFamily: "Playfair Display, serif" }}>
              ✅ Recebidas ({pagas.length})
            </h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {pagas.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #2c2010", opacity: 0.6 }}>
                  <td className="px-4 py-2" style={{ color: "#a08868" }}>{c.cli}</td>
                  <td className="px-4 py-2" style={{ color: "#a08868" }}>{c.descricao || "—"}</td>
                  <td className="px-4 py-2" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>{fmt(c.val)}</td>
                  <td className="px-4 py-2" style={{ color: "#6a5438" }}>{formatDate(c.venc)}</td>
                  <td className="px-4 py-2">
                    <form action={async () => { "use server"; await togglePago(c.id, false); }}>
                      <button type="submit" className="text-xs px-2 py-1 rounded" style={{ background: "#2c2010", color: "#a08868" }}>
                        ↩ Desfazer
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <form action={async () => { "use server"; await deleteConta(c.id); }}>
                      <button type="submit" className="text-xs px-2 py-1 rounded" style={{ background: "#3a1a10", color: "#bf4e38" }}>🗑</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
