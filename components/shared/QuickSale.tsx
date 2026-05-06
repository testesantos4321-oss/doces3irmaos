"use client";
import { useState, useTransition } from "react";

type Cliente = { nome: string; preco: number; qtd: number };

export function QuickSale({ clientes }: { clientes: Cliente[] }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    data: today,
    cliente: "",
    tipo: "varejo",
    qtd: "",
    preco: "",
    pag: "pix",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-fill price when client is selected
  const handleClienteChange = (nome: string) => {
    const c = clientes.find((cl) => cl.nome === nome);
    set("cliente", nome);
    if (c) {
      if (c.preco) set("preco", c.preco.toFixed(2));
      if (c.qtd) set("qtd", String(c.qtd));
    }
  };

  const total = (Number(form.qtd) || 0) * (Number(form.preco) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const { addReceita } = await import("@/lib/actions/receitas");
      await addReceita(fd);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
        setForm({ data: today, cliente: "", tipo: "varejo", qtd: "", preco: "", pag: "pix" });
      }, 1800);
    });
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9989]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Registrar venda rápida"
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: open
            ? "linear-gradient(135deg,#4a9e6e,#6ec090)"
            : "linear-gradient(135deg,#221808,#2c2010)",
          border: "2px solid #4a9e6e",
          color: open ? "#0a1f10" : "#4a9e6e",
          boxShadow: "0 4px 20px rgba(74,158,110,.35)",
        }}
      >
        {open ? "✕" : "💚"}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute bottom-14 right-0 w-80 rounded-xl shadow-2xl animate-fade-in-scale overflow-hidden"
          style={{ background: "#1a1208", border: "1px solid #4a9e6e" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ background: "#0a1f10", borderBottom: "1px solid #1a3d1a" }}
          >
            <span style={{ fontFamily: "Playfair Display, serif", color: "#6ec090", fontSize: "0.95em" }}>
              💚 Venda Rápida
            </span>
            {total > 0 && (
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(74,158,110,.2)", color: "#6ec090", fontFamily: "DM Mono, monospace" }}
              >
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            )}
          </div>

          {done ? (
            <div className="p-8 text-center animate-fade-in-scale">
              <div className="text-4xl mb-2">✅</div>
              <div className="font-semibold" style={{ color: "#6ec090" }}>Venda registrada!</div>
              <div className="text-xs mt-1" style={{ color: "#6a5438" }}>
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {/* Date */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Data</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => set("data", e.target.value)}
                  className="input-gold"
                  required
                />
              </div>

              {/* Client */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Cliente</label>
                <input
                  list="qs-clientes"
                  value={form.cliente}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  placeholder="Nome do cliente"
                  className="input-gold"
                  required
                />
                <datalist id="qs-clientes">
                  {clientes.map((c) => <option key={c.nome} value={c.nome} />)}
                </datalist>
              </div>

              {/* Qty + Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Potes</label>
                  <input
                    type="number"
                    min="1"
                    value={form.qtd}
                    onChange={(e) => set("qtd", e.target.value)}
                    placeholder="0"
                    className="input-gold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Preço/un</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco}
                    onChange={(e) => set("preco", e.target.value)}
                    placeholder="0,00"
                    className="input-gold"
                    required
                  />
                </div>
              </div>

              {/* Type + Payment */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => set("tipo", e.target.value)}
                    className="input-gold"
                  >
                    <option value="varejo">Varejo</option>
                    <option value="atacado">Atacado</option>
                    <option value="evento">Evento</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Pagamento</label>
                  <select
                    value={form.pag}
                    onChange={(e) => set("pag", e.target.value)}
                    className="input-gold"
                  >
                    <option value="pix">Pix</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="credito">Crédito</option>
                    <option value="debito">Débito</option>
                    <option value="prazo">A prazo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || !form.cliente || !form.qtd || !form.preco}
                className="w-full py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background:
                    isPending || !form.cliente || !form.qtd || !form.preco
                      ? "#2c2010"
                      : "linear-gradient(135deg,#4a9e6e,#6ec090)",
                  color:
                    isPending || !form.cliente || !form.qtd || !form.preco
                      ? "#6a5438"
                      : "#0a1f10",
                }}
              >
                {isPending ? "Salvando…" : `✅ Registrar ${total > 0 ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Venda"}`}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
