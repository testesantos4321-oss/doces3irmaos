import { Header } from "@/components/layout/Header";
import { Nav } from "@/components/layout/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div
        className="text-center py-1.5 text-xs italic tracking-wide"
        style={{
          background: "linear-gradient(90deg, #0f0700, #1c1005, #0f0700)",
          borderBottom: "1px solid #3a2c18",
          color: "#c8872c",
        }}
      >
        🙏 &nbsp;"Deus seja louvado" &nbsp;·&nbsp; Feito à mão desde 2002 &nbsp;·&nbsp; Garanhuns, PE
      </div>
      <Nav />
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "24px" }}>
        {children}
      </main>
      <footer
        className="text-center mt-12"
        style={{
          background: "linear-gradient(135deg, #110800, #1c1005)",
          borderTop: "3px solid #c8872c",
          padding: "26px",
        }}
      >
        <div style={{ fontFamily: "Pacifico, cursive", color: "#e5b050", fontSize: "1.3em", marginBottom: 4 }}>
          Doces 3 Irmãos
        </div>
        <div style={{ color: "#a08868", fontSize: "0.78em", fontStyle: "italic", marginBottom: 10 }}>
          🙏 "Deus seja louvado" — Feito com amor desde 2002
        </div>
        <div style={{ color: "#6a5438", fontSize: "0.72em" }}>
          Sistema de Gestão · Doces 3 Irmãos · Garanhuns, PE · 2026
        </div>
      </footer>
    </>
  );
}
