"use client";
import { useRef } from "react";
import { upsertMeta } from "@/lib/actions/metas";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = { background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" };

export function MetaForm({ mesAtual }: { mesAtual: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await upsertMeta(formData);
    formRef.current?.reset();
  }

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
      <h3 className="text-base mb-4 pb-3" style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc", borderBottom: "1px solid #3a2c18" }}>
        🎯 Definir / Atualizar Meta
      </h3>
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Mês *</label>
            <input name="mes" type="month" required defaultValue={mesAtual} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Meta Receita R$ *</label>
            <input name="rec" type="number" required step="0.01" min="0" placeholder="0,00" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Meta Potes</label>
            <input name="potes" type="number" min="0" placeholder="0" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Meta Fornadas</label>
            <input name="forn" type="number" min="0" placeholder="0" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Meta Clientes</label>
            <input name="cli" type="number" min="0" placeholder="0" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button type="submit" className="font-bold px-5 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}>
          🎯 Salvar Meta
        </button>
      </form>
    </div>
  );
}
