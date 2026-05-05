import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { FornadaForm } from "./FornadaForm";
import { deleteFornada } from "@/lib/actions/fornadas";
import { fmt, formatDate } from "@/lib/utils";

export default async function FornadasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: fornadas } = await supabase
    .from("fornadas")
    .select("*")
    .eq("user_id", user.id)
    .order("data", { ascending: false });

  const totalPotes = (fornadas || []).reduce((a, f) => a + f.qtd, 0);
  const totalCusto = (fornadas || []).reduce((a, f) => a + f.custo, 0);

  return (
    <div>
      <PageHeader title="🍯 Fornadas" subtitle={`${(fornadas || []).length} fornadas · ${totalPotes} potes · Custo: ${fmt(totalCusto)}`} />
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
