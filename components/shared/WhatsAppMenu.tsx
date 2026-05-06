"use client";
import { useState } from "react";

type Cliente = {
  nome: string;
  tel: string;
  tipo: string;
  qtd: number;
  preco: number;
  dia: string;
  cidade?: string;
};

type Conta = {
  val: number;
  venc: string;
  desc?: string;
};

function fmtBR(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Message templates ─────────────────────────────────────────────────────────
function buildMessages(c: Cliente, contaVencendo?: Conta) {
  const nome = c.nome.split(" ")[0]; // first name only
  const pedido = c.qtd > 0 ? `${c.qtd} potes` : "seus potes";
  const valorPedido = c.qtd > 0 ? fmtBR(c.qtd * c.preco) : fmtBR(c.preco);

  const msgs: { label: string; emoji: string; text: string }[] = [];

  // 1. Saudação simples
  msgs.push({
    label: "Saudação",
    emoji: "👋",
    text: `Olá ${nome}! Tudo bem? Aqui é o Antonio dos Doces 3 Irmãos. Passando para dar um alô. 😊`,
  });

  // 2. Confirmação de pedido
  msgs.push({
    label: "Confirmar pedido",
    emoji: "✅",
    text: `Olá ${nome}! Confirmando seu pedido de *${pedido}* para ${c.dia === "variavel" ? "esta semana" : c.dia}. Valor: *${valorPedido}*. Pode confirmar? 🍯`,
  });

  // 3. Aviso de entrega
  msgs.push({
    label: "Aviso de entrega",
    emoji: "🛵",
    text: `Olá ${nome}! Seus doces estão a caminho! 🍯 Chegaremos em ${c.cidade || "aí"} em breve. ${c.dia === "retirada" ? "Pode vir retirar!" : "Fique à vontade para me avisar quando chegar."}`,
  });

  // 4. Cobrança vencida (só aparece se tiver conta)
  if (contaVencendo) {
    const venc = fmtData(contaVencendo.venc);
    const hoje = new Date().toISOString().slice(0, 10);
    const vencida = contaVencendo.venc < hoje;
    msgs.push({
      label: vencida ? "Cobrança vencida" : "Lembrete de vencimento",
      emoji: vencida ? "⚠️" : "🔔",
      text: vencida
        ? `Olá ${nome}! Tudo bem? Passando para lembrar que temos um valor em aberto de *${fmtBR(contaVencendo.val)}* que venceu em ${venc}. Quando conseguir acertar, me avisa! 😊`
        : `Olá ${nome}! Lembrando que seu pagamento de *${fmtBR(contaVencendo.val)}* vence dia *${venc}*. Qualquer dúvida, estou por aqui! 🍯`,
    });
  }

  // 5. Pix recebido / agradecimento
  msgs.push({
    label: "Confirmar Pix",
    emoji: "💚",
    text: `Olá ${nome}! Pix recebido, obrigado! ✅ Seu pedido está confirmado. Qualquer coisa é só chamar. Deus abençoe! 🙏`,
  });

  // 6. Novo produto / promoção
  msgs.push({
    label: "Novidade / promoção",
    emoji: "🎉",
    text: `Olá ${nome}! Temos novidade nos Doces 3 Irmãos! 🍯✨ Quer saber mais sobre nossos doces e sabores da semana? Me chama que te conto tudo!`,
  });

  // 7. Atacado-específico
  if (c.tipo === "atacado") {
    msgs.push({
      label: "Proposta atacado",
      emoji: "📦",
      text: `Olá ${nome}! Temos disponibilidade para atacado esta semana. Seu preço negociado é *${fmtBR(c.preco)}/pote*. Quantos potes você vai precisar? Assim já separamos para você! 🍯`,
    });
  }

  // 8. Evento-específico
  if (c.tipo === "evento") {
    msgs.push({
      label: "Confirmar evento",
      emoji: "🎪",
      text: `Olá ${nome}! Estamos confirmando nosso fornecimento para o seu evento. Você ainda precisa dos doces? Quantos potes? Só me avisar que a gente garante! 🍯🎪`,
    });
  }

  return msgs;
}

// ── Main component ─────────────────────────────────────────────────────────────
export function WhatsAppMenu({
  cliente,
  contaVencendo,
}: {
  cliente: Cliente;
  contaVencendo?: Conta;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!cliente.tel) return null;

  // Clean phone: keep only digits
  const tel = cliente.tel.replace(/\D/g, "");
  const telWA = tel.startsWith("55") ? tel : `55${tel}`;

  const msgs = buildMessages(cliente, contaVencendo);

  const handleClick = (text: string) => {
    const url = `https://wa.me/${telWA}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative">
      {/* WhatsApp button */}
      <button
        onClick={() => setOpen(!open)}
        title="Mensagens WhatsApp"
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
        style={{
          background: open ? "#25D366" : "rgba(37,211,102,.15)",
          color: open ? "#0d1a10" : "#25D366",
          border: "1px solid rgba(37,211,102,.35)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-9 z-50 w-72 rounded-xl shadow-2xl overflow-hidden animate-fade-in-scale"
            style={{ background: "#1a1208", border: "1px solid #25D366", minWidth: 288 }}
          >
            {/* Header */}
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: "#0d1a10", borderBottom: "1px solid #1a3d1a" }}
            >
              <span style={{ color: "#25D366", fontSize: "0.95em" }}>💬</span>
              <span className="text-xs font-semibold" style={{ color: "#25D366" }}>
                Mensagens para {cliente.nome.split(" ")[0]}
              </span>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(37,211,102,.15)", color: "#25D366" }}
              >
                {tel}
              </span>
            </div>

            {/* Messages list */}
            <div className="py-1 max-h-80 overflow-y-auto scrollbar-none">
              {msgs.map((m) => (
                <div
                  key={m.label}
                  className="group px-4 py-2.5 cursor-pointer tr-hover flex items-start gap-3"
                  style={{ borderBottom: "1px solid #2c2010" }}
                  onClick={() => handleClick(m.text)}
                >
                  <span className="text-base mt-0.5 shrink-0">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#e4d8c0" }}>
                      {m.label}
                    </div>
                    <div
                      className="text-[10px] leading-relaxed truncate"
                      style={{ color: "#6a5438" }}
                    >
                      {m.text.slice(0, 70)}…
                    </div>
                  </div>
                  {/* Copy button */}
                  <button
                    onClick={(e) => handleCopy(m.text, m.label, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: "#2c2010", color: "#a08868" }}
                    title="Copiar texto"
                  >
                    {copied === m.label ? "✓" : "📋"}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div
              className="px-4 py-2 text-center text-[10px]"
              style={{ background: "#0d1a10", color: "#3a5c3a" }}
            >
              Clique para abrir no WhatsApp · 📋 para copiar
            </div>
          </div>
        </>
      )}
    </div>
  );
}
