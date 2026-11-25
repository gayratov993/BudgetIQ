"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "@/components/i18n-provider";
import { localizeCategoryName } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";
import type { CategorySpend } from "@/types";

export function ExpenseDonut({
  data,
  currency,
}: {
  data: CategorySpend[];
  currency: string;
}) {
  const { d } = useI18n();
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const top = data.slice(0, 6);
  const rest = data.slice(6);
  const chartData: CategorySpend[] =
    rest.length > 0
      ? [
          ...top,
          {
            categoryId: "other",
            name: d.charts.other,
            color: "#64748b",
            icon: "CircleEllipsis",
            amount: rest.reduce((sum, item) => sum + item.amount, 0),
            share: rest.reduce((sum, item) => sum + item.share, 0),
            count: rest.reduce((sum, item) => sum + item.count, 0),
          },
        ]
      : top;

  if (!data.length) {
    return (
      <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
        {d.charts.empty}
      </div>
    );
  }

  return (
    <div>
      <div className="relative mx-auto h-[200px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                color: "var(--foreground)",
              }}
              formatter={(value) => formatMoney(Number(value), currency)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {d.charts.total}
          </span>
          <span className="num text-sm font-semibold">{formatMoney(total, currency)}</span>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {chartData.slice(0, 5).map((item) => (
          <li key={item.categoryId} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate">
              {localizeCategoryName(item.categoryId, item.name, d)}
            </span>
            <span className="ml-auto shrink-0 text-muted-foreground">{item.share}%</span>
            <span className="num w-20 shrink-0 text-right text-[11px] text-muted-foreground">
              {formatMoney(item.amount, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
