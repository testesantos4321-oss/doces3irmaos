import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { CrmForm } from "./CrmForm";
import { deleteInteracao } from "@/lib/actions/crm";
import { today } from "@/lib/utils";

const tipoConfig: Record<string, { label: string; color: string; bg: string }> = {
  nota:     { label: "📝 Nota",     color: "#a08868", bg: "#2c2010" },
  ligacao:  { label: "📞 Ligação",  color: "#4a9e6e", bg: "#0e2018" },
  visita:   { label: "🚗 Visita",   color: "#4878b0", bg: "#0e1828" },
  pedido:   { label: "📦 Pedido",   color: "#c8872c", bg: "#2c1e08" },
  cobranca: { label: "💳 Cobrança", color: "#bf4e38", bg: "#2c0f0a" },
};

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: interacoes }, { data: clientes }] = await Promise.all([
    supabase
      .from("crm_interacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false }),
    supabase
      .from("clientes")
      .select("nome")
      .eq("user_id", user.id)
      .order("nome"),
  ]);

  const td = today();

  // Agrupar por cliente
  const porCliente: Record<string, typeof interacoes> = {};
  for (const i of (interacoes ?? [])) {
    if (!porCliente[i.cliente_nome]) porCliente[i.cliente_nome] = [];
    porCliente[i.cliente_nome]!.push(i);
  }

  // Próximos follow-ups
  const followups = (interacoes ?? [])
    .filter((i) => i.prox_contato && i.prox_contato >= td)
    .sort((a, b) => a.prox_contato!.localeCompare(b.prox_contato!))
    .slice(0, 5);

  const atrasados = (interacoes ?? [])
    .filter((i) => i.prox_contato && i.prox_contato < td)
    .length;

  return (
    <div>
      <PageHeader
        title="🤝 CRM — Relacionamento"
        subtitle={`${Object.keys(porCliente).length} clientes com histórico · ${followups.length} follow-ups pendentes`}
      />

      <CrmForm clientes={clientes ?? []} />

      {/* ── Alertas de follow-up ──────────────────────── */}
      {(followups.length > 0 || atrasados > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 animate-fade-in">
          {atrasados > 0 && (
            <div
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ background: "#2c0f0a", border: "1px solid #bf4e38" }}
            >
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#e07060" }}>
                  {atrasados} follow-up{atrasados > 1 ? "s" : ""} em atraso
                </div>
                <div className="text-xs" style={{ color: "#6a5438" }}>
                  Verifique os clientes abaixo
                </div>
              </div>
            </div>
          )}
          {followups.length > 0 && (
            <div
              className="rounded-xl px-5 py-4"
              style={{ background: "#0e2018", border: "1px solid #4a9e6e" }}
            >
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#4a9e6e" }}>
                📅 Próximos contatos
              </div>
              {followups.slice(0, 3).map((f) => {
                const d = new Date(f.prox_contato! + "T00:00:00");
                return (
                  <div key={f.id} className="flex justify-between text-sm mb-1">
                    <span style={{ color: "#f3e6cc" }}>{f.cliente_nome}</span>
                    <span style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace", fontSize: "0.8em" }}>
                      {d.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Timeline por cliente ──────────────────────── */}
      {Object.keys(porCliente).length === 0 ? (
        <div
          className="rounded-xl p-12 text-center animate-fade-in"
          style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
        >
          <div className="text-4xl mb-3">🤝</div>
          <p className="font-semibold mb-1" style={{ color: "#a08868" }}>Nenhuma interação registrada.</p>
          <p className="text-sm" style={{ color: "#6a5438" }}>
            Clique em "+ Nova Interação" para começar a registrar seu histórico de clientes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(porCliente).map(([nome, ints], gi) => {
            const ultima = ints![0];
            const tc = tipoConfig[ultima.tipo] ?? tipoConfig.nota;
            const temFollowup = ints!.some((i) => i.prox_contato);
            const proxFollowup = ints!
              .filter((i) => i.prox_contato)
              .sort((a, b) => a.prox_contato!.localeCompare(b.prox_contato!))[0];
            const followupAtrasado = proxFollowup && proxFollowup.prox_contato! < td;

            return (
              <div
                key={nome}
                className="rounded-xl overflow-hidden card-hover animate-fade-in"
                style={{
                  border: "1px solid #3a2c18",
                  animationDelay: `${gi * 60}ms`,
                }}
              >
                {/* Cliente header */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: "#221808", borderBottom: "1px solid #2c2010" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: "#3a2c18", color: "#e5b050" }}
                    >
                      {nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: "#f3e6cc" }}>{nome}</div>
                      <div className="text-xs" style={{ color: "#6a5438" }}>
                        {ints!.length} interaç{ints!.length === 1 ? "ão" : "ões"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {proxFollowup && (
                      <span
                        className="badge"
                        style={{
                          background: followupAtrasado ? "#2c0f0a" : "#0e2018",
                          color: followupAtrasado ? "#e07060" : "#4a9e6e",
                        }}
                      >
                        {followupAtrasado ? "⚠️ Atrasado" : "📅 " + new Date(proxFollowup.prox_contato! + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    <span
                      className="badge"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {tc.label}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ background: "#1a1208" }}>
                  {ints!.map((i, idx) => {
                    const cfg = tipoConfig[i.tipo] ?? tipoConfig.nota;
                    const d = new Date(i.data + "T00:00:00");
                    return (
                      <div
                        key={i.id}
                        className="tr-hover flex gap-4 px-5 py-3.5"
                        style={{
                          borderBottom: idx < ints!.length - 1 ? "1px solid #2c2010" : "none",
                        }}
                      >
                        {/* Timeline line */}
                        <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0 }}>
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}
                          >
                            {d.getDate()}
                          </div>
                          {idx < ints!.length - 1 && (
                            <div className="w-px flex-1 mt-1" style={{ background: "#2c2010", minHeight: 16 }} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                  className="badge text-[11px]"
                                  style={{ background: cfg.bg, color: cfg.color }}
                                >
                                  {cfg.label}
                                </span>
                                <span className="text-xs" style={{ color: "#6a5438", fontFamily: "DM Mono, monospace" }}>
                                  {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                                {i.prox_contato && (
                                  <span
                                    className="badge text-[10px]"
                                    style={{
                                      background: i.prox_contato < td ? "#2c0f0a" : "#221808",
                                      color: i.prox_contato < td ? "#e07060" : "#4878b0",
                                    }}
                                  >
                                    📅 Retornar {new Date(i.prox_contato + "T00:00:00").toLocaleDateString("pt-BR")}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm" style={{ color: "#e4d8c0", lineHeight: 1.5 }}>
                                {i.descricao}
                              </p>
                            </div>
                            <form action={async () => { "use server"; await deleteInteracao(i.id); }}>
                              <button
                                type="submit"
                                className="text-xs px-2 py-1 rounded opacity-40 hover:opacity-100 transition-opacity"
                                style={{ background: "#3a1a10", color: "#bf4e38" }}
                              >
                                🗑
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
