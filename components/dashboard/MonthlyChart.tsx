"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type MonthPoint = {
  label: string;   // "Jan", "Fev" etc.
  receita: number;
  despesa: number;
  lucro: number;
};

const fmtK = (v: number) =>
  v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`;

export function MonthlyChart({ data }: { data: MonthPoint[] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-40" style={{ color: "#6a5438" }}>
      Dados insuficientes — registre receitas para ver a evolução.
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2c2010" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#a08868", fontSize: 11 }}
          axisLine={{ stroke: "#3a2c18" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtK}
          tick={{ fill: "#6a5438", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "#221808",
            border: "1px solid #3a2c18",
            borderRadius: 10,
            color: "#e4d8c0",
            fontSize: 12,
          }}
          formatter={(val: number, name: string) => [
            val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            name === "receita" ? "Receita" : name === "despesa" ? "Despesa" : "Lucro",
          ]}
          labelStyle={{ color: "#a08868", marginBottom: 4 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(v) =>
            v === "receita" ? "Receita" : v === "despesa" ? "Despesa" : "Lucro"
          }
        />
        <Line
          type="monotone"
          dataKey="receita"
          stroke="#4a9e6e"
          strokeWidth={2}
          dot={{ fill: "#4a9e6e", r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="despesa"
          stroke="#bf4e38"
          strokeWidth={2}
          dot={{ fill: "#bf4e38", r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="lucro"
          stroke="#e5b050"
          strokeWidth={2.5}
          strokeDasharray="5 3"
          dot={{ fill: "#e5b050", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
