"use client";
import { useRef } from "react";
import { addDespesa } from "@/lib/actions/despesas";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = { background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" };

const categorias = [
  "Matéria-Prima", "Embalagens", "Gás/Energia", "Transporte",
  "Marketing", "Aluguel", "Manutenção", "Impostos", "Outros",
];

export function DespesaForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addDespesa(formData);
    formRef.current?.reset();
  }

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
      <h3 className="text-base mb-4 pb-3" style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc", borderBottom: "1px solid #3a2c18" }}>
        ➕ Nova Despesa
      </h3>
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Data *</label>
            <input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Categoria *</label>
            <select name="cat" required className={inputCls} style={inputStyle}>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Descrição *</label>
            <input name="descricao" type="text" required placeholder="Ex: Açúcar 50kg" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Valor R$ *</label>
            <input name="val" type="number" required step="0.01" min="0" placeholder="0,00" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Fornecedor</label>
            <input name="forn" type="text" placeholder="Opcional" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button type="submit" className="font-bold px-5 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#bf4e38,#e07060)", color: "#fff" }}>
          ✅ Registrar Despesa
        </button>
      </form>
    </div>
  );
}
