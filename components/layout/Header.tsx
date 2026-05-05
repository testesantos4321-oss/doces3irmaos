import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header
      className="sticky top-0 z-50 px-7 py-3.5 flex items-center justify-between flex-wrap gap-2 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #170a01 0%, #281406 50%, #381e0a 100%)",
        borderBottom: "3px solid #c8872c",
      }}
    >
      <div className="flex items-center gap-3.5">
        <svg width="48" height="48" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
          <circle cx="27" cy="27" r="26" fill="#220d00" stroke="#c8872c" strokeWidth="2.5" />
          <ellipse cx="27" cy="39" rx="19" ry="8.5" fill="#1c4810" />
          <ellipse cx="27" cy="32" rx="11.5" ry="8" fill="#eeead8" />
          <ellipse cx="22" cy="29" rx="3.2" ry="2.6" fill="#111" opacity=".8" />
          <ellipse cx="33" cy="33" rx="2.8" ry="2.3" fill="#111" opacity=".8" />
          <ellipse cx="27" cy="20.5" rx="6.2" ry="5.3" fill="#eeead8" />
          <ellipse cx="21.5" cy="18.5" rx="2.3" ry="1.7" fill="#eeead8" />
          <ellipse cx="32.5" cy="18.5" rx="2.3" ry="1.7" fill="#eeead8" />
          <ellipse cx="27" cy="23" rx="3.3" ry="2.1" fill="#dba888" />
          <circle cx="25" cy="19" r="1.05" fill="#111" />
          <circle cx="29" cy="19" r="1.05" fill="#111" />
          <rect x="9.5" y="36" width="7.5" height="6.5" rx="1.8" fill="#c8872c" />
          <text x="13.5" y="41" fontSize="3" fill="#1a0800" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">D3</text>
        </svg>
        <div>
          <div style={{ fontFamily: "Pacifico, cursive", color: "#e5b050", fontSize: "1.25em" }}>
            Doces 3 Irmãos
          </div>
          <div style={{ color: "#a08868", fontSize: "0.72em" }}>
            🍯 Doces Artesanais · Garanhuns, PE
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href="https://wa.me/5587999914092"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{
            background: "rgba(200,135,44,.1)",
            border: "1px solid rgba(200,135,44,.22)",
            color: "#e5b050",
          }}
        >
          📲 (87) 99991-4092
        </a>
        <a
          href="https://instagram.com/doces_3_irmao"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(200,135,44,.1)",
            border: "1px solid rgba(200,135,44,.22)",
            color: "#e5b050",
          }}
        >
          📸 @doces_3_irmao
        </a>
        <span
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            color: "#a08868",
            background: "#221808",
            border: "1px solid #3a2c18",
          }}
        >
          {now}
        </span>
        {user && (
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#6a5438", border: "1px solid #3a2c18" }}
            >
              Sair
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
