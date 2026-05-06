"use client";
import { useEffect, useRef } from "react";

export function ParallaxBanner({ mes }: { mes: string }) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return;
      // Move the pseudo-background at 40% of scroll speed (parallax ratio)
      const y = window.scrollY * 0.4;
      bgRef.current.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{ height: 140, background: "#110b03" }}
    >
      {/* Parallax decorative layer */}
      <div
        ref={bgRef}
        className="parallax-bg absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 120% at 80% 50%, rgba(200,135,44,.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 80% at 20% 50%, rgba(229,176,80,.10) 0%, transparent 60%),
            linear-gradient(135deg, #1a1208 0%, #0f0b07 100%)
          `,
          top: -30,
          bottom: -30,
        }}
      />

      {/* Floating sugar particles */}
      {[
        { x: "12%", y: "20%", s: 6, o: 0.4, d: 0 },
        { x: "25%", y: "70%", s: 4, o: 0.25, d: 0.8 },
        { x: "55%", y: "30%", s: 5, o: 0.3, d: 0.4 },
        { x: "70%", y: "65%", s: 7, o: 0.2, d: 1.2 },
        { x: "88%", y: "35%", s: 4, o: 0.35, d: 0.6 },
        { x: "42%", y: "55%", s: 3, o: 0.2, d: 1.5 },
        { x: "90%", y: "70%", s: 5, o: 0.15, d: 0.3 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            background: "#e5b050",
            opacity: p.o,
            animationDelay: `${p.d}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8">
        <div
          className="animate-fade-in"
          style={{ fontFamily: "Pacifico, cursive", color: "#e5b050", fontSize: "1.6em", lineHeight: 1.2 }}
        >
          Doces 3 Irmãos
        </div>
        <div
          className="animate-fade-in delay-100"
          style={{ fontFamily: "Playfair Display, serif", color: "#a08868", fontSize: "0.92em", marginTop: 4, fontStyle: "italic" }}
        >
          Dashboard · {mes}
        </div>
        <div className="flex items-center gap-2 mt-3 animate-fade-in delay-200">
          {["💚 Receitas", "🔴 Despesas", "🍯 Lucro"].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(200,135,44,.15)", color: "#c8872c", border: "1px solid rgba(200,135,44,.25)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right decorative arch */}
      <div
        className="absolute right-0 top-0 bottom-0 w-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at right, rgba(200,135,44,.08) 0%, transparent 70%)",
        }}
      />

      {/* Bottom gold line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#c8872c,transparent)" }}
      />
    </div>
  );
}
