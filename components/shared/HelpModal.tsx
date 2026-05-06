"use client";
import { useState } from "react";

const modulos = [
  { icon: "📊", nome: "Dashboard", desc: "Visão geral do mês: receitas, despesas, lucro, metas e alertas de contas vencendo." },
  { icon: "💚", nome: "Receitas", desc: "Registre cada venda — varejo, atacado ou evento. Controle forma de pagamento e cliente." },
  { icon: "👥", nome: "Clientes", desc: "Cadastro completo: endereço, rota de entrega, dia fixo, preço negociado e nota fiscal." },
  { icon: "🎪", nome: "Eventos", desc: "Planeje feiras e eventos: potes planejados, vendidos e faturamento real." },
  { icon: "🍯", nome: "Fornadas", desc: "Registro de cada fornada: quantidade, custo, sabores e responsável." },
  { icon: "📦", nome: "Estoque", desc: "Controle de ingredientes e embalagens com alerta de estoque mínimo." },
  { icon: "🔴", nome: "Despesas", desc: "Gastos do negócio por categoria: ingredientes, gás, embalagem, etc." },
  { icon: "💳", nome: "Contas a Receber", desc: "Controle de prazo com alerta de vencimento em 7 dias. Marque como pago." },
  { icon: "👨‍👩‍👧", nome: "Pessoal", desc: "Gastos familiares separados dos gastos do negócio para visão real do lucro." },
  { icon: "🎯", nome: "Metas", desc: "Defina metas mensais de receita, potes, fornadas e clientes. Acompanhe o progresso." },
  { icon: "🤝", nome: "CRM", desc: "Histórico de relacionamento com clientes: ligações, visitas, pedidos e follow-ups." },
  { icon: "🧾", nome: "Fiscal", desc: "Resumo de notas fiscais emitidas e clientes que exigem CNPJ." },
  { icon: "⚙️", nome: "Config", desc: "Custos de produção (leite, açúcar, gás, embalagem) e preços de venda por modalidade." },
];

export function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Ajuda e instruções"
        className="fixed bottom-6 left-6 z-[9990] w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110 active:scale-95"
        style={{
          background: "#221808",
          border: "2px solid #3a2c18",
          color: "#a08868",
          boxShadow: "0 4px 16px rgba(0,0,0,.4)",
        }}
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9995] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl animate-fade-in-scale"
            style={{ background: "#1a1208", border: "1px solid #c8872c", maxHeight: "85vh" }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#221808,#2c1e08)", borderBottom: "1px solid #3a2c18" }}
            >
              <div>
                <div style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", fontSize: "1.1em" }}>
                  📖 Guia do Sistema
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#a08868" }}>
                  Doces 3 Irmãos — Sistema de Gestão
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors hover:bg-[#3a2c18]"
                style={{ color: "#6a5438" }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(85vh - 80px)" }}>
              {/* Quick tips */}
              <div
                className="rounded-xl p-4 mb-5"
                style={{ background: "#221808", border: "1px solid #3a2c18" }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#c8872c" }}>
                  ⚡ Dicas Rápidas
                </div>
                <ul className="space-y-1.5 text-sm" style={{ color: "#a08868" }}>
                  <li>📝 O <strong style={{ color: "#e4d8c0" }}>botão 📝</strong> (canto inferior direito) é seu bloco de notas rápido</li>
                  <li>🗂 A navegação está organizada em grupos: <strong style={{ color: "#e4d8c0" }}>Vendas, Produção, Financeiro, Gestão</strong></li>
                  <li>📊 O <strong style={{ color: "#e4d8c0" }}>Dashboard</strong> atualiza automaticamente ao registrar qualquer dado</li>
                  <li>🎯 Configure suas <strong style={{ color: "#e4d8c0" }}>metas mensais</strong> para ver o progresso no dashboard</li>
                  <li>⚙️ Acesse <strong style={{ color: "#e4d8c0" }}>Config</strong> primeiro para configurar custos e preços de venda</li>
                  <li>🤝 Use o <strong style={{ color: "#e4d8c0" }}>CRM</strong> para anotar cada contato com seu cliente (ligação, pedido, cobrança)</li>
                </ul>
              </div>

              {/* Modules grid */}
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6a5438" }}>
                Módulos do Sistema
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {modulos.map((m, i) => (
                  <div
                    key={m.nome}
                    className="rounded-xl px-4 py-3 card-hover animate-fade-in"
                    style={{
                      background: "#221808",
                      border: "1px solid #2c2010",
                      animationDelay: `${i * 30}ms`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{m.icon}</span>
                      <div>
                        <div className="text-sm font-semibold mb-0.5" style={{ color: "#f3e6cc" }}>
                          {m.nome}
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: "#6a5438" }}>
                          {m.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center mt-5 pt-4" style={{ borderTop: "1px solid #2c2010" }}>
                <div style={{ fontFamily: "Pacifico, cursive", color: "#c8872c", fontSize: "0.9em" }}>
                  Doces 3 Irmãos
                </div>
                <div className="text-xs mt-1" style={{ color: "#6a5438" }}>
                  🙏 "Deus seja louvado" · Garanhuns, PE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
