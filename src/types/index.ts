export type TransactionTypeValue = "INCOME" | "EXPENSE";

export type CategoryDTO = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionTypeValue;
  userId: string | null;
};

export type TransactionDTO = {
  id: string;
  amount: number;
  type: TransactionTypeValue;
  description: string | null;
  date: string;
  category: Pick<CategoryDTO, "id" | "name" | "color" | "icon">;
};

export type CategorySpend = {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  share: number;
  count: number;
};

export type MonthlyPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

export type BudgetStatus = {
  id: string;
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  limit: number;
  spent: number;
  pct: number;
};

export type DashboardKpis = {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  savingsRate: number;
  budgetTotal: number;
  budgetSpent: number;
  budgetPct: number;
  monthTxCount: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  byCategory: CategorySpend[];
  monthly: MonthlyPoint[];
  budgets: BudgetStatus[];
  recent: TransactionDTO[];
  hasData: boolean;
  currency: string;
};

export type Insight = {
  title: string;
  body: string;
  tone: "good" | "warning" | "info";
};

export type ParsedTransaction = {
  amount: number;
  type: TransactionTypeValue;
  categoryId: string;
  categoryName: string;
  description: string;
  date: string;
};
