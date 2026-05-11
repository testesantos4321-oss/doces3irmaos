import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProdutoForm } from "./ProdutoForm";
import { deleteProduto, updateEstoque } from "@/lib/actions/produtos";
import { fmt } from "@/lib/utils";

const catColor: Record<string, string> = {
  Doce:       "#c8872c",
  Ingrediente:"#4878b0",
  Embalagem:  "#8858a0",
  Utensílio:  "#4a9e6e",
  Outro:      "#a08868",
};

export default async function ProdutosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("user_id", user.id)
    .order("nome");

  const lista = produtos || [];
  const baixoEstoque = lista.filter((p) => p.estoque_atual <= p.estoque_min && p.estoque_min > 0);
  const totalValorEstoque = lista.reduce((a, p) => a + p.custo * p.estoque_atual, 0);

  return (
    <div>
      <PageHeader
        title="📦 Estoque de Produtos"
        subtitle={`${lista.length} produtos · ${baixoEstoque.length} com estoque baixo`}
      />

      {/* ── Alerts ─────────────────────────────────────────── */}
      {baixoEstoque.length > 0 && (
        <div
          className="rounded-xl p-4 mb-5 animate-fade-in"
          style={{ background: "rgba(191,78,56,.12)", border: "1px solid #bf4e38" }}
        >
          <div className="text-sm font-semibold mb-2" style={{ color: "#bf4e38" }}>
            ⚠️ Estoque baixo — reabasteça em breve
          </div>
          <div className="flex flex-wrap gap-2">
            {baixoEstoque.map((p) => (
              <span
                key={p.id}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(191,78,56,.2)", color: "#e07060" }}
              >
                {p.nome} — {p.estoque_atual} {p.unidade}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Summary strip ───────────────────────────────────── */}
      {lista.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 row-animate">
          {[
            { label: "Total produtos", val: lista.length, suffix: " itens", color: "#e5b050" },
            { label: "Valor em estoque", val: fmt(totalValorEstoque), color: "#4a9e6e" },
            { label: "Estoque baixo", val: baixoEstoque.length, suffix: " itens", color: "#bf4e38" },
            { label: "Categorias", val: new Set(lista.map((p) => p.categoria)).size, suffix: " tipos", color: "#8858a0" },
          ].map(({ label, val, suffix, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 card-hover"
              style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
            >
              <div className="text-xs mb-1" style={{ color: "#6a5438" }}>{label}</div>
              <div
                className="text-xl font-bold"
                style={{ color, fontFamily: "DM Mono, monospace" }}
              >
                {val}{suffix || ""}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProdutoForm />

      {/* ── Product grid ────────────────────────────────────── */}
      {!lista.length ? (
        <div
          className="rounded-2xl p-12 text-center animate-fade-in"
          style={{ background: "#1a1208", border: "1px dashed #3a2c18" }}
        >
          <div className="text-5xl mb-3">📦</div>
          <div className="font-semibold mb-1" style={{ color: "#e4d8c0" }}>
            Nenhum produto cadastrado
          </div>
          <div className="text-sm" style={{ color: "#6a5438" }}>
            Clique em "+ Novo Produto" para começar
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lista.map((p, i) => {
            const margin = p.preco_venda > 0 && p.custo > 0
              ? (((p.preco_venda - p.custo) / p.preco_venda) * 100).toFixed(0)
              : null;
            const estoqueOk = p.estoque_min === 0 || p.estoque_atual > p.estoque_min;
            const cor = catColor[p.categoria] || "#a08868";

            return (
              <div
                key={p.id}
                className="rounded-2xl overflow-hidden card-hover animate-fade-in"
                style={{
                  background: "#1a1208",
                  border: `1px solid ${estoqueOk ? "#2c2010" : "#bf4e38"}`,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                {/* Product image */}
                <div
                  className="relative"
                  style={{ height: 180, background: "#221808", overflow: "hidden" }}
                >
                  {p.imagem_url ? (
                    <img
                      src={p.imagem_url}
                      alt={p.nome}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl opacity-30">📦</span>
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cor + "33", color: cor, border: `1px solid ${cor}55` }}
                    >
                      {p.categoria}
                    </span>
                  </div>

                  {/* Low stock badge */}
                  {!estoqueOk && (
                    <div className="absolute top-2 right-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(191,78,56,.85)", color: "#fff" }}
                      >
                        ⚠️ Baixo
                      </span>
                    </div>
                  )}

                  {/* Margin badge */}
                  {margin && (
                    <div className="absolute bottom-2 right-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: Number(margin) >= 30
                            ? "rgba(74,158,110,.85)"
                            : "rgba(200,135,44,.85)",
                          color: "#fff",
                        }}
                      >
                        {margin}% margem
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="font-semibold mb-1" style={{ color: "#f3e6cc", fontFamily: "Playfair Display, serif" }}>
                    {p.nome}
                  </div>
                  {p.descricao && (
                    <div
                      className="text-xs mb-3 line-clamp-2 leading-relaxed"
                      style={{ color: "#6a5438" }}
                    >
                      {p.descricao}
                    </div>
                  )}

                  {/* Prices */}
                  <div className="flex gap-3 mb-3">
                    <div>
                      <div className="text-[10px] mb-0.5" style={{ color: "#503c20" }}>Custo</div>
                      <div className="text-sm font-bold" style={{ color: "#e07060", fontFamily: "DM Mono, monospace" }}>
                        {fmt(p.custo)}
                      </div>
                    </div>
                    {p.preco_venda > 0 && (
                      <div>
                        <div className="text-[10px] mb-0.5" style={{ color: "#503c20" }}>Venda</div>
                        <div className="text-sm font-bold" style={{ color: "#4a9e6e", fontFamily: "DM Mono, monospace" }}>
                          {fmt(p.preco_venda)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock control */}
                  <div
                    className="flex items-center justify-between py-2 px-3 rounded-lg mb-3"
                    style={{ background: "#221808" }}
                  >
                    <div>
                      <div className="text-[10px]" style={{ color: "#503c20" }}>Estoque</div>
                      <div
                        className="font-bold"
                        style={{
                          color: estoqueOk ? "#e5b050" : "#bf4e38",
                          fontFamily: "DM Mono, monospace",
                        }}
                      >
                        {p.estoque_atual} <span className="text-xs font-normal">{p.unidade}</span>
                      </div>
                    </div>

                    {/* +/- buttons */}
                    <div className="flex items-center gap-1">
                      <form action={async () => { "use server"; await updateEstoque(p.id, -1); }}>
                        <button
                          type="submit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
                          style={{ background: "#3a1a10", color: "#bf4e38" }}
                        >
                          −
                        </button>
                      </form>
                      <form action={async () => { "use server"; await updateEstoque(p.id, 1); }}>
                        <button
                          type="submit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
                          style={{ background: "#0a1f10", color: "#4a9e6e" }}
                        >
                          +
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Delete */}
                  <form action={async () => { "use server"; await deleteProduto(p.id); }}>
                    <button
                      type="submit"
                      className="w-full text-xs py-1.5 rounded-lg transition-opacity hover:opacity-80"
                      style={{ background: "#2c1010", color: "#6a3030" }}
                    >
                      🗑 Remover produto
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
