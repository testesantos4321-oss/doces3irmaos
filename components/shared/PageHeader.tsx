export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl"
        style={{ fontFamily: "Playfair Display, serif", color: "#f3e6cc" }}
      >
        {title}
      </h1>
      <p className="text-sm mt-0.5" style={{ color: "#a08868" }}>
        {subtitle}
      </p>
    </div>
  );
}
