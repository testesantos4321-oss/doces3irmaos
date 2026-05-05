import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmt } from "@/lib/utils";

const diasOrdem = ["quarta", "sexta", "sabado", "variavel", "retirada"];
const diasLabel: Record<string, string> = {
  quarta: "🚗 Rota Quarta-feira",
  sexta: "🚗 Rota Sexta-feira",
  sabado: "🚗 Rota Sábado",
  variavel: "📅 Entrega Variável",
  retirada: "🏠 Retirada no Local",
};

export default async function RotasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .order("nome");

  const grouped: Record<string, typeof clientes> = {};
  for (const dia of diasOrdem) {
    const lista = (clientes || []).filter((c) => c.dia === dia);
    if (lista.length) grouped[dia] = lista;
  }

  const totalPotes = (clientes || []).reduce((a, c) => a + (c.qtd || 0), 0);
  const totalValor = (clientes || []).reduce((a, c) => a + (c.qtd || 0) * c.preco, 0);

  return (
    <div>
      <PageHeader
        title="🚗 Rotas de Entrega"
        subtitle={`${(clientes || []).length} clientes · ${totalPotes} potes/semana · ${fmt(totalValor)}/semana`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {diasOrdem.map((dia) => {
          const lista = (clientes || []).filter((c) => c.dia === dia);
          const potes = lista.reduce((a, c) => a + (c.qtd || 0), 0);
          return (
            <div key={dia} className="rounded-xl p-4 text-center" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
              <div className="text-lg mb-1">{diasLabel[dia].split(" ")[0]}</div>
              <div className="text-sm font-semibold" style={{ color: "#f3e6cc" }}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </div>
              <div style={{ fontFamily: "DM Mono, monospace", color: "#e5b050", fontSize: "1.2em", fontWeight: 700 }}>
                {lista.length}
              </div>
              <div className="text-xs" style={{ color: "#a08868" }}>{potes} potes</div>
            </div>
          );
        })}
      </div>

      {/* Grouped by day */}
      <div className="flex flex-col gap-4">
        {Object.entries(grouped).map(([dia, lista]) => {
          const potesTotal = (lista || []).reduce((a, c) => a + (c.qtd || 0), 0);
          const valorTotal = (lista || []).reduce((a, c) => a + (c.qtd || 0) * c.preco, 0);
          return (
            <div key={dia} className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a2c18" }}>
              <div
                className="px-5 py-3 flex justify-between items-center"
                style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}
              >
                <h3 className="font-semibold" style={{ fontFamily: "Playfair Display, serif", color: "#e5b050" }}>
                  {diasLabel[dia]}
                </h3>
                <span className="text-sm" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>
                  {(lista || []).length} clientes · {potesTotal} potes · {fmt(valorTotal)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#1e1508" }}>
                    {["#", "Cliente", "Cidade", "Qtd", "Preço", "Total", "Telefone", "Obs."].map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-semibold" style={{ color: "#a08868", borderBottom: "1px solid #2c2010" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(lista || []).map((c, idx) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid #2c2010" }}>
                      <td className="px-4 py-2.5" style={{ color: "#6a5438", fontFamily: "DM Mono, monospace" }}>{idx + 1}</td>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: "#f3e6cc" }}>
                        <div>{c.nome}</div>
                        {c.endereco && <div className="text-xs" style={{ color: "#6a5438" }}>{c.endereco}</div>}
                      </td>
                      <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{c.cidade}</td>
                      <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{c.qtd || "—"}</td>
                      <td className="px-4 py-2.5" style={{ color: "#a08868", fontFamily: "DM Mono, monospace" }}>{fmt(c.preco)}</td>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: "#e5b050", fontFamily: "DM Mono, monospace" }}>
                        {c.qtd > 0 ? fmt(c.qtd * c.preco) : "—"}
                      </td>
                      <td className="px-4 py-2.5" style={{ color: "#a08868" }}>{c.tel}</td>
                      <td className="px-4 py-2.5 max-w-[120px] truncate text-xs" style={{ color: "#6a5438" }}>{c.obs || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {!Object.keys(grouped).length && (
          <div className="rounded-xl p-10 text-center" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <p style={{ color: "#6a5438" }}>Nenhum cliente com rota definida ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
