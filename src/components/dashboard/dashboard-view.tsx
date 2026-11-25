"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  Lightbulb,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/utils";
import { localizeCategoryName } from "@/lib/i18n";
import { CategoryIcon } from "@/components/category-icon";
import { ExpenseDonut } from "@/components/charts/expense-donut";
import { MonthlyBars } from "@/components/charts/monthly-bars";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData, Insight } from "@/types";

type AnalyticsResponse = DashboardData & { insights: Insight[]; aiProvider: string | null };

const insightTone = {
  good: { className: "border-emerald-500/20 bg-emerald-500/5", icon: TrendingUp, color: "text-emerald-500" },
  warning: { className: "border-amber-500/20 bg-amber-500/5", icon: AlertTriangle, color: "text-amber-500" },
  info: { className: "border-sky-500/20 bg-sky-500/5", icon: Lightbulb, color: "text-sky-500" },
} as const;

export function DashboardView({ name }: { name: string }) {
  const { d } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api<AnalyticsResponse>("/api/analytics"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium">{d.common.loadError}</p>
        <p className="mt-1 text-xs text-muted-foreground">{d.common.refreshHint}</p>
      </Card>
    );
  }

  const { kpis, currency } = data;
  const monthName = `${d.months[new Date().getMonth()]} ${new Date().getFullYear()}`;
  const firstName = name.split(" ")[0] || d.common.user;

  const kpiCards = [
    {
      label: d.dashboard.kpiBalance,
      value: formatMoney(kpis.balance, currency),
      hint: d.dashboard.kpiBalanceHint,
      icon: Wallet,
      tone: "text-sky-500 bg-sky-500/10",
    },
    {
      label: d.dashboard.kpiIncome,
      value: formatMoney(kpis.monthIncome, currency),
      hint: monthName,
      icon: ArrowDownLeft,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: d.dashboard.kpiExpense,
      value: formatMoney(kpis.monthExpense, currency),
      hint: d.dashboard.kpiExpenseHint(kpis.monthTxCount),
      icon: ArrowUpRight,
      tone: "text-rose-500 bg-rose-500/10",
    },
    {
      label: d.dashboard.kpiSavings,
      value: `${kpis.savingsRate}%`,
      hint: kpis.savingsRate >= 20 ? d.dashboard.kpiSavingsGood : d.dashboard.kpiSavingsImprove,
      icon: PiggyBank,
      tone: "text-violet-500 bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.dashboard.greeting(firstName)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{d.dashboard.subtitle(monthName)}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions?new=1">
            <Button size="sm">
              <Plus className="h-4 w-4" /> {d.dashboard.addTransaction}
            </Button>
          </Link>
          <Link href="/ai-advisor">
            <Button size="sm" variant="outline">
              <Bot className="h-4 w-4" /> {d.dashboard.openAdvisor}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="num mt-2 text-xl font-semibold tracking-tight">{kpi.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{kpi.hint}</p>
              </div>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${kpi.tone}`}>
                <kpi.icon className="h-4.5 w-4.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {!data.hasData ? (
        <Card className="border-emerald-500/25 bg-emerald-500/5 p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{d.dashboard.firstStepTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.dashboard.firstStepBody}</p>
            </div>
            <Link href="/transactions?new=1">
              <Button size="sm">
                <Plus className="h-4 w-4" /> {d.common.add}
              </Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>{d.dashboard.dynamicsTitle}</CardTitle>
              <CardDescription>{d.dashboard.dynamicsDesc}</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {d.charts.income}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> {d.charts.expense}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <MonthlyBars data={data.monthly} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{d.dashboard.distributionTitle}</CardTitle>
            <CardDescription>{d.dashboard.distributionDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseDonut data={data.byCategory} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{d.dashboard.insightsTitle}</CardTitle>
              <CardDescription>
                {data.aiProvider
                  ? d.dashboard.insightsBasedOn(data.aiProvider)
                  : d.dashboard.insightsLocal}
              </CardDescription>
            </div>
            <Link href="/ai-advisor">
              <Button variant="ghost" size="sm">
                {d.dashboard.chat} <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.insights.map((insight) => {
              const tone = insightTone[insight.tone];
              return (
                <div
                  key={insight.title}
                  className={`flex gap-3 rounded-xl border p-3.5 ${tone.className}`}
                >
                  <tone.icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.color}`} />
                  <div>
                    <p className="text-xs font-semibold">{insight.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {insight.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{d.dashboard.budgetsTitle}</CardTitle>
              <CardDescription>
                {formatMoney(kpis.budgetSpent, currency)} / {formatMoney(kpis.budgetTotal, currency)}
              </CardDescription>
            </div>
            <Link href="/budgets" className="text-[11px] font-medium text-primary hover:underline">
              {d.dashboard.manage}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {data.budgets.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                {d.dashboard.noBudget}
              </p>
            ) : (
              data.budgets.slice(0, 4).map((budget) => (
                <div key={budget.id}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CategoryIcon name={budget.icon} color={budget.color} className="h-3.5 w-3.5" />
                      {localizeCategoryName(budget.categoryId, budget.name, d)}
                    </span>
                    <span className={budget.pct >= 100 ? "text-rose-500" : "text-muted-foreground"}>
                      {budget.pct}%
                    </span>
                  </div>
                  <Progress value={budget.pct} color={budget.pct >= 100 ? "#e11d48" : budget.color} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{d.dashboard.recentTitle}</CardTitle>
            <CardDescription>{d.dashboard.recentDesc}</CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm">
              {d.dashboard.all} <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="divide-y divide-border/70">
          {data.recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {d.dashboard.noTransactions}
            </p>
          ) : (
            data.recent.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3">
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${tx.category.color}1a` }}
                >
                  <CategoryIcon name={tx.category.icon} color={tx.category.color} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {tx.description || localizeCategoryName(tx.category.id, tx.category.name, d)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {localizeCategoryName(tx.category.id, tx.category.name, d)} ·{" "}
                    {formatDate(tx.date)}
                  </p>
                </div>
                <span
                  className={`num shrink-0 text-xs font-semibold ${
                    tx.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "−"}
                  {formatMoney(tx.amount, currency)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 pb-2">
        <Badge tone={data.aiProvider ? "success" : "warning"}>
          <Sparkles className="h-3 w-3" />
          {data.aiProvider ? d.dashboard.aiBadge(data.aiProvider) : d.dashboard.localBadge}
        </Badge>
        <Badge tone="default">{d.dashboard.dbBadge}</Badge>
        <Badge tone="default">{d.dashboard.currencyBadge(currency)}</Badge>
      </div>
    </div>
  );
}
