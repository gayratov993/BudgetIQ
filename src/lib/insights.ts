import type { DashboardData, Insight } from "@/types";
import { formatMoney } from "./utils";
import {
  DEFAULT_LOCALE,
  getDictionary,
  localizeCategoryName,
  type Locale,
} from "./i18n";

export function buildInsights(data: DashboardData, locale: Locale = DEFAULT_LOCALE): Insight[] {
  const d = getDictionary(locale);

  if (!data.hasData) {
    return [
      {
        title: d.insights.noDataTitle,
        body: d.insights.noDataBody,
        tone: "info",
      },
    ];
  }

  const insights: Insight[] = [];
  const { kpis, byCategory, monthly, budgets } = data;
  const money = (v: number) => formatMoney(v, data.currency);
  const top = byCategory[0];

  if (top) {
    const high = top.share >= 35;
    insights.push({
      title: d.insights.topTitle(localizeCategoryName(top.categoryId, top.name, d)),
      body: d.insights.topBody(money(top.amount), top.share, high),
      tone: high ? "warning" : "info",
    });
  }

  const prev = monthly[monthly.length - 2];
  const cur = monthly[monthly.length - 1];
  if (prev && cur && prev.expense > 0) {
    const diff = Math.round(((cur.expense - prev.expense) / prev.expense) * 100);
    if (Math.abs(diff) >= 5) {
      insights.push({
        title: diff > 0 ? d.insights.upTitle(diff) : d.insights.downTitle(Math.abs(diff)),
        body: d.insights.compareBody(diff, money(prev.expense), money(cur.expense)),
        tone: diff > 0 ? "warning" : "good",
      });
    }
  }

  const worst = [...budgets].sort((a, b) => b.pct - a.pct)[0];
  if (worst) {
    const name = localizeCategoryName(worst.categoryId, worst.name, d);
    if (worst.pct >= 100) {
      insights.push({
        title: d.insights.overTitle(name),
        body: d.insights.overBody(money(worst.limit), money(worst.spent), worst.pct),
        tone: "warning",
      });
    } else if (worst.pct >= 80) {
      insights.push({
        title: d.insights.nearTitle(name),
        body: d.insights.nearBody(worst.pct, money(Math.max(0, worst.limit - worst.spent))),
        tone: "warning",
      });
    }
  }

  if (insights.length < 3) {
    const good = kpis.savingsRate >= 20;
    insights.push({
      title: good ? d.insights.savingsGoodTitle : d.insights.savingsImproveTitle,
      body: d.insights.savingsBody(
        Math.max(0, kpis.savingsRate),
        money(Math.max(0, kpis.monthIncome - kpis.monthExpense)),
        good,
      ),
      tone: good ? "good" : "info",
    });
  }

  return insights.slice(0, 4);
}
