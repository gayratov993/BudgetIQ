import type { TransactionType } from "@prisma/client";
import { prisma } from "./prisma";
import { MONTHS_UZ, monthKey, monthLabel, percent } from "./utils";
import type {
  BudgetStatus,
  CategorySpend,
  DashboardData,
  MonthlyPoint,
  TransactionDTO,
} from "@/types";

export function monthRange(date: Date) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
  };
}

type TxWithCategory = {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: Date;
  category: { id: string; name: string; color: string; icon: string };
};

export function toTransactionDTO(tx: TxWithCategory): TransactionDTO {
  return {
    id: tx.id,
    amount: tx.amount,
    type: tx.type,
    description: tx.description,
    date: tx.date.toISOString(),
    category: {
      id: tx.category.id,
      name: tx.category.name,
      color: tx.category.color,
      icon: tx.category.icon,
    },
  };
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const now = new Date();
  const currentKey = monthKey(now);
  const sixStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [user, totals, txs, budgets, recent] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { currency: true } }),
    prisma.transaction.groupBy({ by: ["type"], where: { userId }, _sum: { amount: true } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: sixStart } },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId, year: now.getFullYear(), month: now.getMonth() + 1 },
      include: { category: true },
      orderBy: { amount: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  const totalIncome = totals.find((t) => t.type === "INCOME")?._sum.amount ?? 0;
  const totalExpense = totals.find((t) => t.type === "EXPENSE")?._sum.amount ?? 0;

  const monthlyMap = new Map<string, MonthlyPoint>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    monthlyMap.set(key, {
      key,
      label: monthLabel(d.getMonth() + 1),
      income: 0,
      expense: 0,
    });
  }

  let monthIncome = 0;
  let monthExpense = 0;
  let monthTxCount = 0;
  const categoryMap = new Map<string, CategorySpend & { color: string }>();

  for (const tx of txs) {
    const key = monthKey(tx.date);
    const point = monthlyMap.get(key);
    if (point) {
      if (tx.type === "INCOME") point.income += tx.amount;
      else point.expense += tx.amount;
    }
    if (key === currentKey) {
      monthTxCount += 1;
      if (tx.type === "INCOME") monthIncome += tx.amount;
      else {
        monthExpense += tx.amount;
        const existing = categoryMap.get(tx.categoryId) ?? {
          categoryId: tx.categoryId,
          name: tx.category.name,
          color: tx.category.color,
          icon: tx.category.icon,
          amount: 0,
          share: 0,
          count: 0,
        };
        existing.amount += tx.amount;
        existing.count += 1;
        categoryMap.set(tx.categoryId, existing);
      }
    }
  }

  const byCategory = [...categoryMap.values()]
    .map((c) => ({ ...c, share: percent(c.amount, monthExpense) }))
    .sort((a, b) => b.amount - a.amount);

  const spentByCategory = new Map(byCategory.map((c) => [c.categoryId, c.amount]));

  const budgetList: BudgetStatus[] = budgets.map((b) => {
    const spent = spentByCategory.get(b.categoryId) ?? 0;
    return {
      id: b.id,
      categoryId: b.categoryId,
      name: b.category.name,
      color: b.category.color,
      icon: b.category.icon,
      limit: b.amount,
      spent,
      pct: percent(spent, b.amount),
    };
  });

  const budgetTotal = budgetList.reduce((sum, b) => sum + b.limit, 0);
  const budgetSpent = budgetList.reduce((sum, b) => sum + b.spent, 0);

  return {
    kpis: {
      balance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      savingsRate: monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0,
      budgetTotal,
      budgetSpent,
      budgetPct: percent(budgetSpent, budgetTotal),
      monthTxCount,
    },
    byCategory,
    monthly: [...monthlyMap.values()],
    budgets: budgetList,
    recent: recent.map(toTransactionDTO),
    hasData: totalIncome > 0 || totalExpense > 0,
    currency: user?.currency ?? "UZS",
  };
}

export type FinancialSnapshot = {
  generatedAt: string;
  currency: string;
  period: { from: string; to: string };
  totals: { income: number; expense: number; savings: number; savingsRate: number };
  monthly: { label: string; income: number; expense: number }[];
  topExpenseCategories: { categoryId: string; name: string; amount: number; share: number }[];
  budgets: { categoryId: string; name: string; limit: number; spent: number; pct: number }[];
  currentMonth: { label: string; income: number; expense: number };
};

export async function getFinancialSnapshot(userId: string): Promise<FinancialSnapshot> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const currentMonthLabel = `${monthLabel(now.getMonth() + 1)} ${now.getFullYear()}`;

  const [user, txs, budgets] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { currency: true } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId, year: now.getFullYear(), month: now.getMonth() + 1 },
      include: { category: true },
    }),
  ]);

  let income = 0;
  let expense = 0;
  const monthly = new Map<string, { label: string; income: number; expense: number }>();
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthly.set(monthKey(d), { label: monthLabel(d.getMonth() + 1), income: 0, expense: 0 });
  }
  const byCategory = new Map<string, { categoryId: string; name: string; amount: number }>();
  let currentIncome = 0;
  let currentExpense = 0;

  for (const tx of txs) {
    const key = monthKey(tx.date);
    const point = monthly.get(key);
    if (tx.type === "INCOME") {
      income += tx.amount;
      if (point) point.income += tx.amount;
    } else {
      expense += tx.amount;
      if (point) point.expense += tx.amount;
      const entry = byCategory.get(tx.categoryId) ?? {
        categoryId: tx.categoryId,
        name: tx.category.name,
        amount: 0,
      };
      entry.amount += tx.amount;
      byCategory.set(tx.categoryId, entry);
    }
    if (key === monthKey(now)) {
      if (tx.type === "INCOME") currentIncome += tx.amount;
      else currentExpense += tx.amount;
    }
  }

  const topExpenseCategories = [...byCategory.values()]
    .map((c) => ({ ...c, share: percent(c.amount, expense) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    generatedAt: now.toISOString(),
    currency: user?.currency ?? "UZS",
    period: { from: start.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) },
    totals: {
      income,
      expense,
      savings: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
    },
    monthly: [...monthly.values()],
    topExpenseCategories,
    budgets: budgets.map((b) => {
      const spent = b.category.id ? (byCategory.get(b.categoryId)?.amount ?? 0) : 0;
      return {
        categoryId: b.categoryId,
        name: b.category.name,
        limit: b.amount,
        spent,
        pct: percent(spent, b.amount),
      };
    }),
    currentMonth: { label: currentMonthLabel, income: currentIncome, expense: currentExpense },
  };
}

export const MONTH_NAMES = MONTHS_UZ;
