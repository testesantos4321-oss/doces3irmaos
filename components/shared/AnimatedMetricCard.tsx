"use client";
import { useEffect, useRef, useState } from "react";

const topColors: Record<string, string> = {
  green:  "linear-gradient(90deg,#4a9e6e,#6ec090)",
  red:    "linear-gradient(90deg,#bf4e38,#e06850)",
  gold:   "linear-gradient(90deg,#c8872c,#e5b050)",
  blue:   "linear-gradient(90deg,#4878b0,#6a9ad0)",
  orange: "linear-gradient(90deg,#d07428,#e89048)",
  purple: "linear-gradient(90deg,#8858a0,#a878c0)",
};

const glowColors: Record<string, string> = {
  green:  "rgba(74,158,110,.15)",
  red:    "rgba(191,78,56,.15)",
  gold:   "rgba(200,135,44,.15)",
  blue:   "rgba(72,120,176,.15)",
  orange: "rgba(208,116,40,.15)",
  purple: "rgba(136,88,160,.15)",
};

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { val, ref };
}

export function AnimatedMetricCard({
  icon,
  label,
  rawValue,
  prefix = "",
  suffix = "",
  sub,
  color,
  delay = 0,
}: {
  icon: string;
  label: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  sub: string;
  color: string;
  delay?: number;
}) {
  const { val, ref } = useCountUp(rawValue, 1200 + delay);

  const formatted =
    prefix === "R$"
      ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${prefix}${val.toLocaleString("pt-BR")}${suffix}`;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-xl p-5 card-hover animate-count-up"
      style={{
        background: "#1a1208",
        border: "1px solid #3a2c18",
        animationDelay: `${delay}ms`,
        transition: "border-color .2s, transform .2s, box-shadow .2s",
      }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: topColors[color] }} />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 25% 0%, ${glowColors[color]} 0%, transparent 65%)` }}
      />

      <div className="relative">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-[0.68em] uppercase tracking-widest mb-1 font-semibold" style={{ color: "#a08868" }}>
          {label}
        </div>
        <div
          className="text-[1.75em] font-medium leading-none tabular-nums"
          style={{ fontFamily: "DM Mono, monospace", color: "#f3e6cc" }}
        >
          {formatted}
        </div>
        <div className="text-[0.7em] mt-1.5" style={{ color: "#6a5438" }}>{sub}</div>
      </div>
    </div>
  );
}
