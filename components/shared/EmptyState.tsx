export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-10" style={{ color: "#6a5438" }}>
      <span className="text-4xl block mb-2">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  );
}
