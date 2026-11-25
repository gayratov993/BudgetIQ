"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, PieChart, Target, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney, percent } from "@/lib/utils";
import { localizeCategoryName } from "@/lib/i18n";
import { CategoryIcon } from "@/components/category-icon";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import type { BudgetStatus, CategoryDTO } from "@/types";

type BudgetsResponse = {
  month: number;
  year: number;
  budgets: BudgetStatus[];
  categories: (CategoryDTO & { spent: number })[];
};

type BudgetCategory = CategoryDTO & { spent: number };

export function BudgetsView({ currency }: { currency: string }) {
  const now = new Date();
  const { d } = useI18n();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => api<BudgetsResponse>(`/api/budgets?month=${month}&year=${year}`),
  });

  const limits = useMemo(() => {
    const map = new Map<string, number>();
    for (const budget of data?.budgets ?? []) map.set(budget.categoryId, budget.limit);
    return map;
  }, [data]);

  const summary = useMemo(() => {
    const categories = data?.categories ?? [];
    const totalLimit = categories.reduce((sum, c) => sum + (limits.get(c.id) ?? 0), 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    const budgetedSpent = categories.reduce(
      (sum, c) => sum + (limits.get(c.id) ? c.spent : 0),
      0,
    );
    return { totalLimit, totalSpent, budgetedSpent, count: limits.size };
  }, [data, limits]);

  function shiftMonth(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  }

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const cards = [
    {
      label: d.budgets.totalLimit,
      value: formatMoney(summary.totalLimit, currency),
      hint: d.budgets.categoriesCount(summary.count),
      icon: Target,
      tone: "text-sky-500 bg-sky-500/10",
    },
    {
      label: isCurrentMonth ? d.budgets.spentBudgeted : d.budgets.spent,
      value: formatMoney(isCurrentMonth ? summary.budgetedSpent : summary.totalSpent, currency),
      hint: null,
      icon: Wallet,
      tone: "text-rose-500 bg-rose-500/10",
    },
    {
      label: d.budgets.remaining,
      value: formatMoney(Math.max(0, summary.totalLimit - summary.budgetedSpent), currency),
      hint: null,
      icon: PieChart,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.budgets.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{d.budgets.subtitle}</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftMonth(-1)}
            aria-label={d.budgets.prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-center text-xs font-medium">
            {d.months[month - 1]} {year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftMonth(1)}
            aria-label={d.budgets.nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((item) => (
          <Card key={item.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="num mt-2 text-lg font-semibold">{item.value}</p>
                {item.hint ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">{item.hint}</p>
                ) : null}
              </div>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}>
                <item.icon className="h-4.5 w-4.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{d.budgets.categoriesTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {(data?.categories ?? []).map((category) => (
                <BudgetRow
                  key={`${month}-${year}-${category.id}-${limits.get(category.id) ?? 0}`}
                  category={category}
                  limit={limits.get(category.id) ?? 0}
                  month={month}
                  year={year}
                  currency={currency}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">{d.budgets.tip}</p>
    </div>
  );
}

function BudgetRow({
  category,
  limit,
  month,
  year,
  currency,
}: {
  category: BudgetCategory;
  limit: number;
  month: number;
  year: number;
  currency: string;
}) {
  const queryClient = useQueryClient();
  const { d } = useI18n();
  const [value, setValue] = useState(limit > 0 ? String(limit) : "");

  const numeric = Math.round(Number(value) || 0);
  const dirty = Number.isFinite(numeric) && numeric !== limit;
  const pct = percent(category.spent, limit);
  const over = limit > 0 && category.spent > limit;

  const mutation = useMutation({
    mutationFn: (amount: number) =>
      api("/api/budgets", {
        method: "PUT",
        body: JSON.stringify({ categoryId: category.id, amount, month, year }),
      }),
    onSuccess: () => {
      toast({ title: d.budgets.saved, tone: "success" });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error) => {
      toast({
        title: d.common.saveFailed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    },
  });

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${category.color}1a` }}
        >
          <CategoryIcon name={category.icon} color={category.color} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-medium">
              {localizeCategoryName(category.id, category.name, d)}
            </p>
            <span className="num shrink-0 text-[11px] text-muted-foreground sm:hidden">
              {formatMoney(category.spent, currency)}
              {limit > 0 ? ` / ${formatMoney(limit, currency)}` : ""}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={pct} color={over ? "#e11d48" : category.color} className="h-1.5" />
            <span
              className={`num w-10 shrink-0 text-right text-[10px] ${
                over ? "text-rose-500" : "text-muted-foreground"
              }`}
            >
              {limit > 0 ? `${pct}%` : "—"}
            </span>
          </div>
          <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
            {d.budgets.spentLabel} {formatMoney(category.spent, currency)}
            {over ? ` · ${d.budgets.overLimit}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:w-72">
        <div className="relative flex-1">
          <Input
            inputMode="numeric"
            placeholder={d.budgets.noLimit}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
            className="pr-10 text-right"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {d.common.som}
          </span>
        </div>
        <Button
          size="icon"
          variant={dirty ? "default" : "ghost"}
          disabled={!dirty}
          loading={mutation.isPending}
          onClick={() => mutation.mutate(numeric)}
          aria-label={d.budgets.saveAria}
          title={d.budgets.saveAria}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
