"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "#0f0b07",
        backgroundImage:
          "radial-gradient(ellipse at 15% 0%,rgba(200,135,44,.1) 0%,transparent 50%)",
      }}
    >
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div
            className="text-4xl mb-1"
            style={{ fontFamily: "Pacifico, cursive", color: "#e5b050" }}
          >
            Doces 3 Irmãos
          </div>
          <div style={{ color: "#a08868", fontSize: "0.85em", fontStyle: "italic" }}>
            🙏 "Deus seja louvado" · Desde 2002
          </div>
        </div>

        <div
          className="rounded-xl p-8 shadow-2xl"
          style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
        >
          <h1
            className="text-xl mb-6"
            style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc" }}
          >
            Entrar no sistema
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "#a08868" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="antonio@doces3irmaos.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "#221808",
                  border: "1px solid #3a2c18",
                  color: "#f3e6cc",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#c8872c")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#3a2c18")
                }
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "#a08868" }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "#221808",
                  border: "1px solid #3a2c18",
                  color: "#f3e6cc",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#c8872c")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#3a2c18")
                }
              />
            </div>

            {error && (
              <p
                className="text-sm rounded-lg px-3 py-2"
                style={{
                  color: "#e07060",
                  background: "rgba(191,78,56,.12)",
                  border: "1px solid rgba(191,78,56,.25)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-2.5 rounded-lg text-sm transition-opacity mt-2"
              style={{
                background: "linear-gradient(135deg, #c8872c, #e5b050)",
                color: "#1a0800",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#6a5438" }}>
          📍 Garanhuns, PE
        </p>
      </div>
    </div>
  );
}
