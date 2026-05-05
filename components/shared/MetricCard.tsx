const topColors: Record<string, string> = {
  green: "linear-gradient(90deg,#4a9e6e,#6ec090)",
  red: "linear-gradient(90deg,#bf4e38,#e06850)",
  gold: "linear-gradient(90deg,#c8872c,#e5b050)",
  blue: "linear-gradient(90deg,#4878b0,#6a9ad0)",
  orange: "linear-gradient(90deg,#d07428,#e89048)",
  purple: "linear-gradient(90deg,#8858a0,#a878c0)",
};

export function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: keyof typeof topColors;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5 transition-transform hover:-translate-y-0.5"
      style={{ background: "#1a1208", border: "1px solid #3a2c18" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: topColors[color] }}
      />
      <div className="text-2xl mb-2">{icon}</div>
      <div
        className="text-[0.68em] uppercase tracking-widest mb-1"
        style={{ color: "#a08868" }}
      >
        {label}
      </div>
      <div
        className="text-[1.65em] font-medium leading-none"
        style={{ fontFamily: "DM Mono, monospace", color: "#f3e6cc" }}
      >
        {value}
      </div>
      <div className="text-[0.7em] mt-1" style={{ color: "#6a5438" }}>
        {sub}
      </div>
    </div>
  );
}
