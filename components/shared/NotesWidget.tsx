"use client";
import { useState, useEffect } from "react";

type Note = { id: string; text: string; ts: number };

export function NotesWidget() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("d3i_notes");
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem("d3i_notes", JSON.stringify(updated));
  };

  const addNote = () => {
    if (!draft.trim()) return;
    save([{ id: Date.now().toString(), text: draft.trim(), ts: Date.now() }, ...notes]);
    setDraft("");
  };

  const del = (id: string) => save(notes.filter((n) => n.id !== id));

  const fmt = (ts: number) =>
    new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed bottom-6 right-6 z-[9990]">
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Bloco de notas"
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: open
            ? "linear-gradient(135deg,#c8872c,#e5b050)"
            : "linear-gradient(135deg,#221808,#2c2010)",
          border: "2px solid #c8872c",
          color: open ? "#1a0800" : "#c8872c",
          boxShadow: "0 4px 20px rgba(200,135,44,.35)",
        }}
      >
        {open ? "✕" : "📝"}
      </button>

      {/* Notes panel */}
      {open && (
        <div
          className="absolute bottom-14 right-0 w-80 rounded-xl shadow-2xl animate-fade-in-scale overflow-hidden"
          style={{
            background: "#1a1208",
            border: "1px solid #c8872c",
            maxHeight: "70vh",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: "#221808", borderBottom: "1px solid #3a2c18" }}
          >
            <span style={{ fontFamily: "Playfair Display, serif", color: "#e5b050", fontSize: "0.95em" }}>
              📝 Bloco de Notas
            </span>
            <span className="text-xs" style={{ color: "#6a5438" }}>
              {notes.length} nota{notes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Draft input */}
          <div className="p-3" style={{ borderBottom: "1px solid #2c2010" }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nova nota... (Ctrl+Enter para salvar)"
              rows={3}
              className="input-gold resize-none text-xs"
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") addNote();
              }}
            />
            <button
              onClick={addNote}
              disabled={!draft.trim()}
              className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: draft.trim()
                  ? "linear-gradient(135deg,#c8872c,#e5b050)"
                  : "#2c2010",
                color: draft.trim() ? "#1a0800" : "#6a5438",
              }}
            >
              + Salvar Nota
            </button>
          </div>

          {/* Notes list */}
          <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
            {notes.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-xs" style={{ color: "#6a5438" }}>
                  Nenhuma nota ainda.<br />Anote lembretes, ideias, combinados.
                </p>
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="tr-hover px-4 py-3 group"
                  style={{ borderBottom: "1px solid #2c2010" }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[10px]" style={{ color: "#6a5438", fontFamily: "DM Mono, monospace" }}>
                      {fmt(n.ts)}
                    </span>
                    <button
                      onClick={() => del(n.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "#3a1a10", color: "#bf4e38" }}
                    >
                      🗑
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#e4d8c0", whiteSpace: "pre-wrap" }}>
                    {n.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
