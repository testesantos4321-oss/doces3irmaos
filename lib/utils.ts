import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(v: number): string {
  return (
    "R$ " +
    (v || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(ds: string): string {
  if (!ds) return "";
  const [y, m, d] = ds.split("-");
  return `${d}/${m}/${y}`;
}

export function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

export function inicioMes(): string {
  return `${mesAtual()}-01`;
}
