"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setMsg("Conta criada! Entrando...");
    // tenta login direto
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (!loginErr) {
      router.push("/");
      router.refresh();
    } else {
      setMsg("Conta criada! Verifique seu email ou faça login.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "#0f0b07",
        backgroundImage: "radial-gradient(ellipse at 15% 0%,rgba(200,135,44,.1) 0%,transparent 50%)",
      }}
    >
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="text-4xl mb-1" style={{ fontFamily: "Pacifico, cursive", color: "#e5b050" }}>
            Doces 3 Irmãos
          </div>
          <div style={{ color: "#a08868", fontSize: "0.85em", fontStyle: "italic" }}>
            🍯 Criar conta de acesso
          </div>
        </div>

        <div className="rounded-xl p-8 shadow-2xl" style={{ background: "#1a1208", border: "1px solid #3a2c18" }}>
          <h1 className="text-xl mb-6" style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc" }}>
            Criar conta
          </h1>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" }}
                onFocus={(e) => (e.target.style.borderColor = "#c8872c")}
                onBlur={(e) => (e.target.style.borderColor = "#3a2c18")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#a08868" }}>
                Senha (mín. 6 caracteres)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: "#221808", border: "1px solid #3a2c18", color: "#f3e6cc" }}
                onFocus={(e) => (e.target.style.borderColor = "#c8872c")}
                onBlur={(e) => (e.target.style.borderColor = "#3a2c18")}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e07060", background: "rgba(191,78,56,.12)", border: "1px solid rgba(191,78,56,.25)" }}>
                {error}
              </p>
            )}
            {msg && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#4a9e6e", background: "rgba(74,158,110,.12)", border: "1px solid rgba(74,158,110,.25)" }}>
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-2.5 rounded-lg text-sm mt-2"
              style={{ background: "linear-gradient(135deg, #c8872c, #e5b050)", color: "#1a0800", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4">
          <Link href="/login" style={{ color: "#a08868" }}>← Já tenho conta</Link>
        </p>
      </div>
    </div>
  );
}
