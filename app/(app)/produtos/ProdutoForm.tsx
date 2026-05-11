"use client";
import { useState, useRef, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { addProduto } from "@/lib/actions/produtos";

const CATEGORIAS = ["Doce", "Ingrediente", "Embalagem", "Utensílio", "Outro"];
const UNIDADES   = ["un", "pote", "kg", "g", "L", "ml", "cx", "pct"];

export function ProdutoForm() {
  const [open, setOpen]       = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl]   = useState("");
  const [isPending, start]    = useTransition();
  const fileRef               = useRef<HTMLInputElement>(null);
  const formRef               = useRef<HTMLFormElement>(null);

  // ── Image upload to Supabase Storage ─────────────────────
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview while uploading
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const supabase = createClient();
      const ext  = file.name.split(".").pop();
      const path = `produtos/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("produto-imgs")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("produto-imgs")
        .getPublicUrl(path);

      setImgUrl(data.publicUrl);
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      alert("Erro ao enviar imagem. Verifique se o bucket 'produto-imgs' existe no Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("imagem_url", imgUrl);
    start(async () => {
      await addProduto(fd);
      formRef.current?.reset();
      setPreview(null);
      setImgUrl("");
      setOpen(false);
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 mb-4"
        style={{
          background: open ? "#2c2010" : "linear-gradient(135deg,#c8872c,#e5b050)",
          color:      open ? "#a08868" : "#1a0800",
          border:     "1px solid #c8872c",
        }}
      >
        {open ? "✕ Cancelar" : "+ Novo Produto"}
      </button>

      {open && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 animate-fade-in-scale"
          style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
        >
          <div
            className="text-base mb-5 pb-3"
            style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", borderBottom: "1px solid #2c2010" }}
          >
            📦 Novo Produto
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LEFT — image upload */}
            <div className="flex flex-col gap-4">
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="relative rounded-xl overflow-hidden cursor-pointer flex items-center justify-center transition-all hover:border-[#c8872c]"
                style={{
                  height: 200,
                  border: "2px dashed #3a2c18",
                  background: "#221808",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-xs" style={{ color: "#6a5438" }}>
                      Clique para selecionar a imagem do produto
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: "#503c20" }}>
                      JPG, PNG, WebP — máx 5MB
                    </div>
                  </div>
                )}

                {/* Upload overlay */}
                {uploading && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(15,11,7,.75)" }}
                  >
                    <div className="text-center">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto mb-2"
                        style={{
                          borderColor: "#c8872c",
                          borderTopColor: "transparent",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <div className="text-xs" style={{ color: "#e5b050" }}>Enviando…</div>
                    </div>
                  </div>
                )}

                {imgUrl && !uploading && (
                  <div
                    className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-lg"
                    style={{ background: "rgba(74,158,110,.9)", color: "#fff" }}
                  >
                    ✓ Imagem salva
                  </div>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />

              {/* Change image button */}
              {preview && (
                <button
                  type="button"
                  onClick={() => { setPreview(null); setImgUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="text-xs py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: "#3a1a10", color: "#bf4e38" }}
                >
                  🗑 Remover imagem
                </button>
              )}
            </div>

            {/* RIGHT — fields */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Nome *</label>
                <input name="nome" required placeholder="Ex: Doce de leite tradicional" className="input-gold" />
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Descrição</label>
                <textarea
                  name="descricao"
                  rows={3}
                  placeholder="Ingredientes, diferenciais, observações…"
                  className="input-gold resize-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Categoria</label>
                  <select name="categoria" className="input-gold">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Unidade</label>
                  <select name="unidade" className="input-gold">
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Custo (R$)</label>
                  <input name="custo" type="number" step="0.01" min="0" placeholder="0,00" className="input-gold" />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Preço de Venda (R$)</label>
                  <input name="preco_venda" type="number" step="0.01" min="0" placeholder="0,00" className="input-gold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Estoque Atual</label>
                  <input name="estoque_atual" type="number" min="0" placeholder="0" className="input-gold" />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#a08868" }}>Estoque Mínimo</label>
                  <input name="estoque_min" type="number" min="0" placeholder="0" className="input-gold" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || uploading}
            className="mt-5 w-full py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: isPending || uploading
                ? "#2c2010"
                : "linear-gradient(135deg,#c8872c,#e5b050)",
              color: isPending || uploading ? "#6a5438" : "#1a0800",
            }}
          >
            {isPending ? "Salvando…" : uploading ? "Aguardando imagem…" : "✅ Salvar Produto"}
          </button>
        </form>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
