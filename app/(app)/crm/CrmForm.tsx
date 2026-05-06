"use client";
import { useState } from "react";
import { addInteracao } from "@/lib/actions/crm";

const tipos = [
  { v: "nota",     label: "📝 Nota",       color: "#a08868" },
  { v: "ligacao",  label: "📞 Ligação",    color: "#4a9e6e" },
  { v: "visita",   label: "🚗 Visita",     color: "#4878b0" },
  { v: "pedido",   label: "📦 Pedido",     color: "#c8872c" },
  { v: "cobranca", label: "💳 Cobrança",   color: "#bf4e38" },
];

export function CrmForm({ clientes }: { clientes: { nome: string }[] }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(fd: FormData) {
    await addInteracao(fd);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}
      >
        + Nova Interação
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-5 mb-5 animate-fade-in-scale"
      style={{ background: "#1a1208", border: "1px solid #c8872c" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc" }}>
          Nova Interação com Cliente
        </h3>
        <button onClick={() => setOpen(false)} style={{ color: "#6a5438" }}>✕</button>
      </div>

      <form action={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
              Cliente
            </label>
            <input
              name="cliente_nome"
              list="clientes-list"
              required
              placeholder="Nome do cliente..."
              className="input-gold"
            />
            <datalist id="clientes-list">
              {clientes.map((c) => (
                <option key={c.nome} value={c.nome} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
              Tipo
            </label>
            <select name="tipo" className="input-gold" style={{ cursor: "pointer" }}>
              {tipos.map((t) => (
                <option key={t.v} value={t.v}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
              Data
            </label>
            <input name="data" type="date" defaultValue={today} required className="input-gold" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
              Próximo Contato
            </label>
            <input name="prox_contato" type="date" className="input-gold" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
            Descrição
          </label>
          <textarea
            name="descricao"
            required
            rows={3}
            placeholder="O que aconteceu? Resultado, combinado, próximos passos..."
            className="input-gold resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2 rounded-lg text-sm"
            style={{ background: "#2c2010", color: "#a08868" }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
