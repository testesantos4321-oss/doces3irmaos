import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { EstoqueForm } from "./EstoqueForm";

export default async function EstoquePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: estoque } = await supabase
    .from("estoque")
    .select("*")
    .eq("user_id", user.id)
    .order("item");

  const baixos = (estoque || []).filter((e) => e.qty <= e.min_qty && e.min_qty > 0);

  return (
    <div>
      <PageHeader title="📦 Estoque" subtitle={`${(estoque || []).length} itens cadastrados`} />

      {baixos.length > 0 && (
        <div className="rounded-xl p-4 mb-4 flex items-center gap-3"
          style={{ background: "#3a1a10", border: "1px solid #bf4e38" }}>
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#e07060" }}>
              {baixos.length} {baixos.length === 1 ? "item abaixo" : "itens abaixo"} do mínimo:
            </p>
            <p className="text-xs" style={{ color: "#a08868" }}>
              {baixos.map((e) => `${e.item} (${e.qty}/${e.min_qty})`).join(", ")}
            </p>
          </div>
        </div>
      )}

      <EstoqueForm />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#221808" }}>
              {["Item", "Qtd Atual", "Qtd Mínima", "Status", "Atualizado"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #3a2c18" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!(estoque?.length) ? (
              <tr>
                <td colSpan={5} className="text-center py-10" style={{ color: "#6a5438" }}>
                  Nenhum item no estoque.
                </td>
              </tr>
            ) : (
              estoque.map((e) => {
                const baixo = e.min_qty > 0 && e.qty <= e.min_qty;
                const ok = !baixo;
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid #2c2010" }}>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>{e.item}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: baixo ? "#e07060" : "#4a9e6e", fontFamily: "DM Mono, monospace" }}>
                      {e.qty}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>
                      {e.min_qty || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={ok
                          ? { background: "#4a9e6e33", color: "#4a9e6e" }
                          : { background: "#bf4e3833", color: "#bf4e38" }}>
                        {ok ? "✅ OK" : "⚠️ Baixo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "#6a5438" }}>
                      {e.updated_at ? new Date(e.updated_at).toLocaleDateString("pt-BR") : "—"}
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
