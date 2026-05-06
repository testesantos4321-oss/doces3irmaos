"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg,#c8872c,#e5b050)",
        color: "#1a0800",
        boxShadow: "0 4px 16px rgba(200,135,44,.3)",
      }}
    >
      🖨️ Imprimir / Salvar PDF
    </button>
  );
}
