"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function RevenueLineChart({
  data,
}: {
  data: { label: string; receita: number; despesa: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2c2010" />
        <XAxis dataKey="label" tick={{ fill: "#6a5438", fontSize: 11 }} />
        <YAxis
          tick={{ fill: "#6a5438", fontSize: 11 }}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip
          formatter={(v) => `R$ ${Number(v).toFixed(2)}`}
          contentStyle={{ background: "#1a1208", border: "1px solid #3a2c18", color: "#e4d8c0" }}
        />
        <Legend wrapperStyle={{ color: "#a08868", fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="receita"
          stroke="#4a9e6e"
          strokeWidth={2}
          dot={false}
          name="Receita"
        />
        <Line
          type="monotone"
          dataKey="despesa"
          stroke="#bf4e38"
          strokeWidth={2}
          dot={false}
          name="Despesa"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const COLORS = [
  "#c8872c", "#4a9e6e", "#bf4e38", "#4878b0",
  "#8858a0", "#d07428", "#2d6e48",
];

export function ExpensePieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (!data.length) {
    return (
      <div
        className="h-52 flex items-center justify-center text-sm"
        style={{ color: "#6a5438" }}
      >
        Sem despesas no período
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `R$ ${Number(v).toFixed(2)}`}
          contentStyle={{ background: "#1a1208", border: "1px solid #3a2c18", color: "#e4d8c0" }}
        />
        <Legend wrapperStyle={{ color: "#a08868", fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
