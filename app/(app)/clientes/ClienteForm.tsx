"use client";
import { useRef } from "react";
import { addCliente } from "@/lib/actions/clientes";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = { background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" };

export function ClienteForm({ precoVarejo = 6.5 }: { precoVarejo?: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addCliente(formData);
    formRef.current?.reset();
  }

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
      <h3 className="text-base mb-4 pb-3" style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc", borderBottom: "1px solid #3a2c18" }}>
        ➕ Novo Cliente
      </h3>
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Nome *</label>
            <input name="nome" type="text" required placeholder="Nome completo" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Tipo *</label>
            <select name="tipo" required className={inputCls} style={inputStyle}>
              <option value="varejo">Varejo</option>
              <option value="atacado">Atacado</option>
              <option value="evento">Evento</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Cidade *</label>
            <input name="cidade" type="text" required placeholder="Ex: Garanhuns" defaultValue="Garanhuns" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Telefone *</label>
            <input name="tel" type="tel" required placeholder="(87) 9xxxx-xxxx" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Endereço</label>
            <input name="endereco" type="text" placeholder="Rua, número, bairro" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Qtd Regular</label>
            <input name="qtd" type="number" min="0" placeholder="0" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Preço R$</label>
            <input name="preco" type="number" step="0.01" min="0" defaultValue={precoVarejo} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Dia de Entrega</label>
            <select name="dia" className={inputCls} style={inputStyle}>
              <option value="quarta">Quarta-feira</option>
              <option value="sexta">Sexta-feira</option>
              <option value="sabado">Sábado</option>
              <option value="variavel">Variável</option>
              <option value="retirada">Retirada</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Nota Fiscal</label>
            <select name="nota" className={inputCls} style={inputStyle}>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>CNPJ</label>
            <input name="cnpj" type="text" placeholder="Opcional" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Referência</label>
            <input name="ref" type="text" placeholder="Quem indicou" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#a08868" }}>Observações</label>
            <input name="obs" type="text" placeholder="Opcional" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button type="submit" className="font-bold px-5 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#c8872c,#e5b050)", color: "#1a0800" }}>
          ✅ Cadastrar Cliente
        </button>
      </form>
    </div>
  );
}
