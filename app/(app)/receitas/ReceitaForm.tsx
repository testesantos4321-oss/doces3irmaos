"use client";
import { useRef, useState } from "react";
import { addReceita } from "@/lib/actions/receitas";
import { fmt } from "@/lib/utils";
import type { Cliente, Config } from "@/lib/types";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = { background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" };

export function ReceitaForm({ clientes, cfg }: { clientes: Cliente[]; cfg: Config | null }) {
  const [qtd, setQtd] = useState("");
  const [preco, setPreco] = useState(String(cfg?.p_varejo ?? 6.50));
  const formRef = useRef<HTMLFormElement>(null);
  const total = (parseFloat(qtd) || 0) * (parseFloat(preco) || 0);

  async function handleSubmit(formData: FormData) {
    await addReceita(formData);
    formRef.current?.reset();
    setQtd("");
    setPreco(String(cfg?.p_varejo ?? 6.50));
  }

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
      <h3 className="text-base mb-4 pb-3" style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc", borderBottom: "1px solid #3a2c18" }}>
        ➕ Nova Venda
      </h3>
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Data *</label>
            <input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Cliente *</label>
            <input name="cliente" type="text" required placeholder="Nome" list="clientes-list" className={inputCls} style={inputStyle} />
            <datalist id="clientes-list">{clientes.map((c) => <option key={c.id} value={c.nome} />)}</datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Canal</label>
            <select name="tipo" className={inputCls} style={inputStyle}>
              <option value="varejo">Varejo (1–11 potes)</option>
              <option value="varejo_desc">Varejo c/ Desc (12+)</option>
              <option value="atacado">Atacado (100+)</option>
              <option value="evento">Evento/Feira</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Qtd Potes *</label>
            <input name="qtd" type="number" required min="1" placeholder="0" value={qtd} onChange={(e) => setQtd(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Preço R$ *</label>
            <input name="preco" type="number" required step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Total</label>
            <input type="text" readOnly value={total ? fmt(total) : ""} className={inputCls} style={{ ...inputStyle, background: "#2c2010", color: "#e5b050", fontFamily: "DM Mono, monospace", fontWeight: 600 }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Pagamento</label>
            <select name="pag" className={inputCls} style={inputStyle}>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="prazo">A prazo</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Observações</label>
            <input name="obs" type="text" placeholder="Opcional" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button type="submit" className="font-bold px-5 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}>
          ✅ Registrar Venda
        </button>
      </form>
    </div>
  );
}
