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
          borderBottom: "1px solid #2c2010",
          color: "#c8872c",
        }}
      >
        🙏 &nbsp;"Deus seja louvado" &nbsp;·&nbsp; Feito à mão desde 2002 &nbsp;·&nbsp; Garanhuns, PE
      </div>
      <Nav />
      <main
        className="animate-fade-in"
        style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 24px 40px" }}
      >
        {children}
      </main>
      <footer
        className="text-center mt-8"
        style={{
          background: "linear-gradient(135deg, #110800, #1c1005)",
          borderTop: "3px solid #c8872c",
          padding: "28px",
        }}
      >
        <div
          style={{
            fontFamily: "Pacifico, cursive",
            color: "#e5b050",
            fontSize: "1.3em",
            marginBottom: 6,
          }}
        >
          Doces 3 Irmãos
        </div>
        <div style={{ color: "#a08868", fontSize: "0.78em", fontStyle: "italic", marginBottom: 8 }}>
          🙏 "Deus seja louvado" — Feito com amor desde 2002
        </div>
        <div style={{ color: "#503c20", fontSize: "0.7em" }}>
          Sistema de Gestão · Doces 3 Irmãos · Garanhuns, PE · 2026
        </div>
      </footer>
    </>
  );
}
