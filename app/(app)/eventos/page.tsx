import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { EventoForm } from "./EventoForm";
import { deleteEvento } from "@/lib/actions/eventos";
import { fmt, today } from "@/lib/utils";
import type { Evento } from "@/lib/types";

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: eventos } = await supabase
    .from("eventos")
    .select("*")
    .eq("user_id", user.id)
    .order("data", { ascending: false });

  const proximos = (eventos || []).filter((e) => e.data >= today());
  const passados = (eventos || []).filter((e) => e.data < today());

  return (
    <div>
      <PageHeader title="🎪 Eventos" subtitle={`${proximos.length} próximos · ${passados.length} realizados`} />
      <EventoForm />

      {proximos.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #3a2c18" }}>
          <div className="px-5 py-3" style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}>
            <h3 className="font-semibold" style={{ color: "#e5b050", fontFamily: "Playfair Display, serif" }}>
              📅 Próximos Eventos ({proximos.length})
            </h3>
          </div>
          {proximos.map((e) => (
            <EventoRow key={e.id} e={e} />
          ))}
        </div>
      )}

      {passados.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2c2010", opacity: 0.85 }}>
          <div className="px-5 py-3" style={{ background: "#1a1208", borderBottom: "1px solid #2c2010" }}>
            <h3 className="font-semibold" style={{ color: "#a08868", fontFamily: "Playfair Display, serif" }}>
              ✅ Eventos Realizados ({passados.length})
            </h3>
          </div>
          {passados.map((e) => (
            <EventoRow key={e.id} e={e} past />
          ))}
        </div>
      )}

      {!(eventos?.length) && (
        <div className="rounded-xl p-10 text-center" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
          <p style={{ color: "#6a5438" }}>Nenhum evento registrado.</p>
        </div>
      )}
    </div>
  );
}

function EventoRow({ e, past = false }: { e: Evento; past?: boolean }) {
  const d = new Date(e.data + "T00:00:00");
  return (
    <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid #2c2010" }}>
      <div className="rounded-xl px-3 py-2 text-center min-w-[52px] shrink-0"
        style={{ background: past ? "#2c2010" : "linear-gradient(135deg,#c8872c,#e5b050)", color: past ? "#6a5438" : "#1a0800" }}>
        <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.4em", lineHeight: 1 }}>
          {d.getDate()}
        </div>
        <div style={{ fontSize: "0.55em", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          {d.toLocaleString("pt-BR", { month: "short" })}
        </div>
        <div style={{ fontSize: "0.5em", letterSpacing: 1 }}>{d.getFullYear()}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold" style={{ color: "#f3e6cc" }}>{e.nome}</div>
        {e.local && <div className="text-xs" style={{ color: "#a08868" }}>📍 {e.local}</div>}
        {e.obs && <div className="text-xs" style={{ color: "#6a5438" }}>{e.obs}</div>}
      </div>
      <div className="flex gap-4 text-sm shrink-0">
        {e.plan > 0 && (
          <div className="text-center">
            <div style={{ color: "#a08868", fontSize: "0.7em" }}>PLAN</div>
            <div style={{ fontFamily: "DM Mono, monospace", color: "#a08868" }}>{e.plan}</div>
          </div>
        )}
        {e.vend > 0 && (
          <div className="text-center">
            <div style={{ color: "#4a9e6e", fontSize: "0.7em" }}>VEND</div>
            <div style={{ fontFamily: "DM Mono, monospace", color: "#4a9e6e" }}>{e.vend}</div>
          </div>
        )}
        {e.fat > 0 && (
          <div className="text-center">
            <div style={{ color: "#e5b050", fontSize: "0.7em" }}>FAT</div>
            <div style={{ fontFamily: "DM Mono, monospace", color: "#e5b050" }}>{fmt(e.fat)}</div>
          </div>
        )}
      </div>
      <form action={async () => { "use server"; await deleteEvento(e.id as string); }}>
        <button type="submit" className="text-xs px-2 py-1 rounded hover:opacity-80"
          style={{ background: "#3a1a10", color: "#bf4e38" }}>🗑</button>
      </form>
    </div>
  );
}
