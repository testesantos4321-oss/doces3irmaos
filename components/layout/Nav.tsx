"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "📊 Dashboard" },
  { href: "/receitas", label: "💚 Receitas" },
  { href: "/despesas", label: "🔴 Despesas" },
  { href: "/fornadas", label: "🍯 Fornadas" },
  { href: "/estoque", label: "📦 Estoque" },
  { href: "/clientes", label: "👥 Clientes" },
  { href: "/rotas", label: "🚗 Rotas" },
  { href: "/contas", label: "💳 Contas" },
  { href: "/eventos", label: "🎪 Eventos" },
  { href: "/metas", label: "🎯 Metas" },
  { href: "/pessoal", label: "👨‍👩‍👧 Pessoal" },
  { href: "/config", label: "⚙️ Config" },
  { href: "/fiscal", label: "🧾 Fiscal" },
  { href: "/historico", label: "📋 Histórico" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-0 overflow-x-auto sticky z-40 scrollbar-none"
      style={{
        background: "#1a1208",
        borderBottom: "1px solid #3a2c18",
        padding: "0 20px",
        top: "74px",
      }}
    >
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              color: active ? "#c8872c" : "#a08868",
              borderBottom: active ? "3px solid #c8872c" : "3px solid transparent",
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
