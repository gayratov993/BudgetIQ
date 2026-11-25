"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/components/i18n-provider";
import { formatMoney } from "@/lib/utils";
import type { MonthlyPoint } from "@/types";

export function MonthlyBars({ data, currency }: { data: MonthlyPoint[]; currency: string }) {
  const { d } = useI18n();

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: string) => {
              const month = Number(value.slice(5, 7));
              return d.monthsShort[month - 1] ?? value;
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: number) =>
              value >= 1_000_000 ? `${Math.round(value / 1_000_000)}m` : `${Math.round(value / 1_000)}k`
            }
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            labelFormatter={(value) => {
              const month = Number(String(value).slice(5, 7));
              return `${d.months[month - 1] ?? ""} ${String(value).slice(0, 4)}`.trim();
            }}
            formatter={(value) => formatMoney(Number(value), currency)}
          />
          <Bar dataKey="income" name={d.charts.income} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="expense" name={d.charts.expense} fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
