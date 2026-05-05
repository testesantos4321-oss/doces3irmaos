import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { saveConfig } from "@/lib/actions/config";
import type { Config } from "@/lib/types";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = { background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" };

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cfg } = await supabase
    .from("config")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle() as { data: Config | null };

  const d = (field: keyof Config, fallback: number) =>
    String(cfg?.[field] ?? fallback);

  return (
    <div>
      <PageHeader title="⚙️ Configurações" subtitle="Custos e preços base do negócio" />

      <form action={saveConfig}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Custos de produção */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="text-base mb-4 pb-3 font-semibold" style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", borderBottom: "1px solid #3a2c18" }}>
              🏭 Custos por Fornada
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { name: "leite", label: "Leite Condensado R$", fallback: 4.5, placeholder: "Ex: 4,50" },
                { name: "acucar", label: "Açúcar R$", fallback: 2, placeholder: "Ex: 2,00" },
                { name: "gas", label: "Gás R$", fallback: 3.5, placeholder: "Ex: 3,50" },
                { name: "embalagem", label: "Embalagem R$ (por pote)", fallback: 0.5, placeholder: "Ex: 0,50" },
                { name: "conservante", label: "Conservante R$", fallback: 0.3, placeholder: "Ex: 0,30" },
                { name: "potes_fornada", label: "Potes por Fornada", fallback: 100, placeholder: "Ex: 100" },
              ].map(({ name, label, fallback, placeholder }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>{label}</label>
                  <input
                    name={name}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={d(name as keyof Config, fallback)}
                    placeholder={placeholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preços de venda */}
          <div className="rounded-xl p-5" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
            <h3 className="text-base mb-4 pb-3 font-semibold" style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", borderBottom: "1px solid #3a2c18" }}>
              💰 Tabela de Preços
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { name: "p_varejo", label: "Preço Varejo R$ (1–11 potes)", fallback: 6.5 },
                { name: "p_desc", label: "Preço Varejo c/ Desc R$ (12+)", fallback: 6 },
                { name: "p_atac", label: "Preço Atacado R$ (100+)", fallback: 6 },
                { name: "p_ev", label: "Preço Evento/Feira R$", fallback: 7 },
              ].map(({ name, label, fallback }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>{label}</label>
                  <input
                    name={name}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={d(name as keyof Config, fallback)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* Info box */}
            <div className="mt-4 rounded-lg p-3" style={{ background: "#2c2010", border: "1px solid #3a2c18" }}>
              <p className="text-xs" style={{ color: "#a08868" }}>
                ℹ️ Os preços são usados como padrão em novos registros mas podem ser ajustados por venda.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="font-bold px-8 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}>
            💾 Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
