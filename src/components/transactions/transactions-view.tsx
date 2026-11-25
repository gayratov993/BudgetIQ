"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/utils";
import { localizeCategoryName } from "@/lib/i18n";
import { CategoryIcon } from "@/components/category-icon";
import { QuickAddModal } from "@/components/transactions/quick-add-modal";
import { SmartInputModal } from "@/components/transactions/smart-input-modal";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import type { CategoryDTO, TransactionDTO } from "@/types";

type TxListResponse = {
  items: TransactionDTO[];
  total: number;
  page: number;
  pageSize: number;
  totals: { income: number; expense: number };
};

export function TransactionsView({ currency }: { currency: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { d } = useI18n();

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(() => searchParams.get("new") === "1");
  const [smartOpen, setSmartOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [qInput]);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  if (categoryId) params.set("categoryId", categoryId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("page", String(page));
  params.set("pageSize", "20");

  const listQuery = useQuery({
    queryKey: ["transactions", params.toString()],
    queryFn: () => api<TxListResponse>(`/api/transactions?${params.toString()}`),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<CategoryDTO[]>("/api/categories"),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: d.transactions.deleted, tone: "success" });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (error) => {
      toast({
        title: d.transactions.deleteFailed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    },
  });

  const categories = categoriesQuery.data ?? [];
  const data = listQuery.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const exportParams = new URLSearchParams();
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  if (type) exportParams.set("type", type);
  if (categoryId) exportParams.set("categoryId", categoryId);

  function resetFilters() {
    setQInput("");
    setQ("");
    setType("");
    setCategoryId("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function onDelete(tx: TransactionDTO) {
    const label =
      tx.description || localizeCategoryName(tx.category.id, tx.category.name, d);
    if (window.confirm(d.transactions.deleteConfirm(label))) {
      deleteMutation.mutate(tx.id);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.transactions.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? d.transactions.found(data.total) : d.transactions.allRecords}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSmartOpen(true)}>
            <Sparkles className="h-4 w-4 text-primary" /> {d.transactions.smartInput}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> {d.common.add}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder={d.transactions.searchPlaceholder}
                className="pl-9"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              aria-label={d.transactions.typeLabel}
            >
              <option value="">{d.transactions.allTypes}</option>
              <option value="EXPENSE">{d.common.expense}</option>
              <option value="INCOME">{d.common.income}</option>
            </Select>
            <Select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              aria-label={d.transactions.categoryLabel}
            >
              <option value="">{d.transactions.allCategories}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {localizeCategoryName(category.id, category.name, d)}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              aria-label={d.transactions.from}
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              aria-label={d.transactions.to}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="success">
              {d.transactions.incomeBadge(formatMoney(data?.totals.income ?? 0, currency))}
            </Badge>
            <Badge tone="danger">
              {d.transactions.expenseBadge(formatMoney(data?.totals.expense ?? 0, currency))}
            </Badge>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                {d.common.clear}
              </Button>
              <a href={`/api/export?${exportParams.toString()}`}>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5" /> {d.common.csv}
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {listQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium">{d.transactions.notFoundTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.transactions.notFoundBody}</p>
              <Button size="sm" className="mt-4" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> {d.common.add}
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {data.items.map((tx) => {
                const categoryName = localizeCategoryName(tx.category.id, tx.category.name, d);
                return (
                  <li
                    key={tx.id}
                    className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/30"
                  >
                    <span
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${tx.category.color}1a` }}
                    >
                      <CategoryIcon name={tx.category.icon} color={tx.category.color} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{tx.description || categoryName}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{categoryName}</span>
                        <span>·</span>
                        <span>{formatDate(tx.date)}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">
                          {tx.type === "INCOME" ? d.common.income : d.common.expense}
                        </span>
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
                    <button
                      onClick={() => onDelete(tx)}
                      className="rounded-lg p-1.5 text-muted-foreground/50 transition hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label={d.transactions.deleteAria}
                      title={d.transactions.deleteAria}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {data && data.total > data.pageSize ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} /{" "}
            {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> {d.transactions.prev}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {d.transactions.next} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {addOpen ? (
        <QuickAddModal
          open
          onClose={() => setAddOpen(false)}
          categories={categories}
          currency={currency}
          onSaved={() => setPage(1)}
        />
      ) : null}
      {smartOpen ? (
        <SmartInputModal
          open
          onClose={() => setSmartOpen(false)}
          categories={categories}
          currency={currency}
          onSaved={() => setPage(1)}
        />
      ) : null}
    </div>
  );
}
