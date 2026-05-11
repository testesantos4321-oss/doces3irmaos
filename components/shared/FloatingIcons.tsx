"use client";
import { useEffect, useRef } from "react";

// Each icon has its own parallax depth (lerpFactor) and home position
const ICONS = [
  { emoji: "🍯", x: 8,  y: 18, size: 52, depth: 0.025, baseOpacity: 0.13 },
  { emoji: "🍬", x: 88, y: 12, size: 38, depth: 0.04,  baseOpacity: 0.11 },
  { emoji: "🍭", x: 5,  y: 62, size: 34, depth: 0.055, baseOpacity: 0.10 },
  { emoji: "🎂", x: 92, y: 55, size: 44, depth: 0.03,  baseOpacity: 0.09 },
  { emoji: "🍯", x: 50, y: 8,  size: 28, depth: 0.07,  baseOpacity: 0.07 },
  { emoji: "🍫", x: 18, y: 85, size: 32, depth: 0.045, baseOpacity: 0.09 },
  { emoji: "✨", x: 78, y: 78, size: 26, depth: 0.06,  baseOpacity: 0.12 },
  { emoji: "🍬", x: 60, y: 90, size: 30, depth: 0.035, baseOpacity: 0.08 },
];

export function FloatingIcons() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track current position of each icon with lerp
  const positions = useRef(
    ICONS.map((ic) => ({
      cx: ic.x, cy: ic.y, // current (lerped) position in vw/vh %
    }))
  );
  const mouse = useRef({ x: 50, y: 50 }); // in %
  const rafId = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const refs = containerRef.current?.children;

    const tick = () => {
      ICONS.forEach((ic, i) => {
        const p = positions.current[i];
        // Parallax offset: icons move opposite to mouse (depth controls magnitude)
        const targetX = ic.x + (mouse.current.x - 50) * ic.depth * -4;
        const targetY = ic.y + (mouse.current.y - 50) * ic.depth * -4;

        // Lerp toward target
        p.cx += (targetX - p.cx) * ic.depth * 1.4;
        p.cy += (targetY - p.cy) * ic.depth * 1.4;

        // Apply to DOM directly (no React re-render = no jank)
        const el = refs?.[i] as HTMLElement | undefined;
        if (el) {
          el.style.left = `${p.cx}vw`;
          el.style.top  = `${p.cy}vh`;
        }
      });
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none no-print"
      style={{ zIndex: 1, overflow: "hidden" }}
      aria-hidden="true"
    >
      {ICONS.map((ic, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            left: `${ic.x}vw`,
            top:  `${ic.y}vh`,
            fontSize: ic.size,
            opacity: ic.baseOpacity,
            // Different float animation per icon for organic feel
            animation: `float-icon ${6 + i * 0.9}s ease-in-out ${i * 0.7}s infinite alternate`,
            filter: "blur(0.3px)",
            willChange: "transform, left, top",
            transform: "translate(-50%, -50%)",
          }}
        >
          {ic.emoji}
        </span>
      ))}
    </div>
  );
}
