"use client";
import { useRef } from "react";
import { updateEstoque } from "@/lib/actions/estoque";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = { background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" };

const itemsPadrao = [
  "Açúcar", "Leite Condensado", "Creme de Leite", "Manteiga",
  "Chocolate em Pó", "Doce de Leite", "Farinha de Trigo",
  "Ovos", "Embalagens (potes)", "Etiquetas",
];

export function EstoqueForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await updateEstoque(formData);
    formRef.current?.reset();
  }

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
      <h3 className="text-base mb-4 pb-3" style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc", borderBottom: "1px solid #3a2c18" }}>
        📝 Atualizar Estoque
      </h3>
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Item *</label>
            <input name="item" type="text" required placeholder="Nome do item" list="itens-list" className={inputCls} style={inputStyle} />
            <datalist id="itens-list">{itemsPadrao.map((i) => <option key={i} value={i} />)}</datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Qtd Atual *</label>
            <input name="qty" type="number" required min="0" placeholder="0" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Qtd Mínima</label>
            <input name="min_qty" type="number" min="0" placeholder="0" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button type="submit" className="font-bold px-5 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}>
          💾 Salvar Estoque
        </button>
      </form>
    </div>
  );
}
