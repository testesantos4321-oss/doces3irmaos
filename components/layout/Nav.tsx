"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";

const groups = [
  {
    id: "inicio",
    label: "🏠 Início",
    color: "#c8872c",
    links: [{ href: "/dashboard", label: "📊 Dashboard" }],
  },
  {
    id: "vendas",
    label: "💰 Vendas",
    color: "#4a9e6e",
    links: [
      { href: "/receitas", label: "💚 Receitas" },
      { href: "/clientes", label: "👥 Clientes" },
      { href: "/eventos", label: "🎪 Eventos" },
      { href: "/rotas", label: "🚗 Rotas" },
    ],
  },
  {
    id: "producao",
    label: "🍯 Produção",
    color: "#d07428",
    links: [
      { href: "/fornadas", label: "🍯 Fornadas" },
      { href: "/estoque", label: "📦 Estoque" },
      { href: "/produtos", label: "🛍️ Produtos" },
    ],
  },
  {
    id: "financeiro",
    label: "💳 Financeiro",
    color: "#4878b0",
    links: [
      { href: "/despesas", label: "🔴 Despesas" },
      { href: "/contas", label: "💳 Contas" },
      { href: "/pessoal", label: "👨‍👩‍👧 Pessoal" },
      { href: "/fiscal", label: "🧾 Fiscal" },
      { href: "/historico", label: "📋 Histórico" },
    ],
  },
  {
    id: "gestao",
    label: "📈 Gestão",
    color: "#8858a0",
    links: [
      { href: "/metas", label: "🎯 Metas" },
      { href: "/crm", label: "🤝 CRM" },
      { href: "/relatorio", label: "📄 Relatório" },
      { href: "/config", label: "⚙️ Config" },
    ],
  },
];

function findGroup(pathname: string) {
  for (const g of groups) {
    if (g.links.some((l) => l.href === pathname)) return g.id;
  }
  return "inicio";
}

export function Nav() {
  const pathname = usePathname();
  const activeGroup = findGroup(pathname);
  const [openGroup, setOpenGroup] = useState(activeGroup);

  const subRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = subRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = subRef.current;
    checkScroll();
    el?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, openGroup]);

  // auto-open correct group when navigating
  useEffect(() => {
    setOpenGroup(findGroup(pathname));
  }, [pathname]);

  // auto-scroll active link into view
  useEffect(() => {
    const el = subRef.current;
    const active = el?.querySelector('[data-active="true"]') as HTMLElement;
    if (el && active) {
      const offset =
        active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2;
      el.scrollTo({ left: offset, behavior: "smooth" });
    }
    setTimeout(checkScroll, 300);
  }, [pathname, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    subRef.current?.scrollBy({ left: dir === "left" ? -180 : 180, behavior: "smooth" });
  };

  const currentGroup = groups.find((g) => g.id === openGroup) ?? groups[0];

  return (
    <div className="sticky z-40" style={{ top: "74px", background: "#13100a", borderBottom: "2px solid #2c2010" }}>
      {/* ── Group tabs ─────────────────────────────────── */}
      <div
        className="flex gap-0 overflow-x-auto scrollbar-none px-2"
        style={{ borderBottom: "1px solid #2c2010" }}
      >
        {groups.map((g) => {
          const isOpen = openGroup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setOpenGroup(g.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200"
              style={{
                color: isOpen ? g.color : "#6a5438",
                borderBottom: isOpen ? `2px solid ${g.color}` : "2px solid transparent",
                background: isOpen ? `${g.color}12` : "transparent",
                letterSpacing: ".04em",
                textTransform: "uppercase",
              }}
            >
              {g.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px]"
                style={{
                  background: isOpen ? `${g.color}22` : "#2c2010",
                  color: isOpen ? g.color : "#6a5438",
                }}
              >
                {g.links.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Sub-links for active group ──────────────────── */}
      <div className="relative flex items-stretch" style={{ minHeight: "42px" }}>
        {/* Left arrow */}
        {canLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-2.5 text-lg"
            style={{
              background: "linear-gradient(90deg, #13100a 55%, transparent)",
              color: currentGroup.color,
            }}
          >
            ‹
          </button>
        )}

        <div
          ref={subRef}
          className="flex overflow-x-auto scrollbar-none"
          style={{ padding: "0 8px" }}
        >
          {currentGroup.links.map((l, i) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                data-active={active}
                className="nav-link px-4 py-2.5 text-sm font-medium whitespace-nowrap"
                style={{
                  color: active ? currentGroup.color : "#a08868",
                  animationDelay: `${i * 40}ms`,
                  animation: "fadeIn .25s ease both",
                }}
              >
                {l.label}
                {active && (
                  <span
                    className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle mb-0.5"
                    style={{ background: currentGroup.color }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right arrow */}
        {canRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-2.5 text-lg"
            style={{
              background: "linear-gradient(270deg, #13100a 55%, transparent)",
              color: currentGroup.color,
            }}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
