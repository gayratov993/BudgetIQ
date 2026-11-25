"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Trash2, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/components/i18n-provider";
import { localizeCategoryName } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";
import type { CategoryDTO, ParsedTransaction } from "@/types";

type ParseResponse = {
  transactions: ParsedTransaction[];
  provider: "ai" | "local";
  message?: string;
};

export function SmartInputModal({
  open,
  onClose,
  categories,
  currency,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryDTO[];
  currency: string;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const { d } = useI18n();
  const [text, setText] = useState("");
  const [provider, setProvider] = useState<"ai" | "local" | null>(null);
  const [rows, setRows] = useState<ParsedTransaction[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const parseMutation = useMutation({
    mutationFn: () =>
      api<ParseResponse>("/api/ai/parse", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: (data) => {
      setProvider(data.provider);
      setRows(data.transactions);
      setMessage(data.message ?? null);
      if (!data.transactions.length) {
        toast({
          title: d.smartInput.notDetected,
          description: data.message,
          tone: "info",
        });
      }
    },
    onError: (error) => {
      toast({
        title: d.smartInput.parseFailed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      api("/api/transactions/bulk", {
        method: "POST",
        body: JSON.stringify({
          transactions: rows.map((row) => ({
            amount: row.amount,
            type: row.type,
            categoryId: row.categoryId,
            description: row.description,
            date: row.date,
          })),
        }),
      }),
    onSuccess: () => {
      toast({ title: d.smartInput.savedCount(rows.length), tone: "success" });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      onSaved();
      onClose();
    },
    onError: (error) => {
      toast({
        title: d.smartInput.failed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    },
  });

  const total = rows.reduce((sum, row) => sum + (row.type === "EXPENSE" ? row.amount : 0), 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={d.smartInput.title}
      description={d.smartInput.description}
      className="sm:max-w-2xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="smart-text">{d.smartInput.inputLabel}</Label>
          <Textarea
            id="smart-text"
            autoFocus
            rows={3}
            maxLength={1000}
            placeholder={d.smartInput.example}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setText(d.smartInput.example)}
              className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {d.smartInput.fillExample}
            </button>
            <span className="text-[11px] text-muted-foreground">{text.length}/1000</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => parseMutation.mutate()}
          disabled={text.trim().length < 3}
          loading={parseMutation.isPending}
        >
          <Wand2 className="h-4 w-4" /> {d.smartInput.analyze}
        </Button>

        {rows.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {d.smartInput.result(rows.length)}
              </p>
              <Badge tone={provider === "ai" ? "success" : "info"}>
                <Sparkles className="h-3 w-3" />
                {provider === "ai" ? d.smartInput.aiAnalysis : d.smartInput.localAnalysis}
              </Badge>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {rows.map((row, index) => {
                const options = categories.filter((c) => c.type === row.type);
                return (
                  <div key={index} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={row.type === "INCOME" ? "success" : "danger"}>
                        {row.type === "INCOME" ? d.common.incomeShort : d.common.expenseShort}
                      </Badge>
                      <span className="num text-xs font-semibold">
                        {formatMoney(row.amount, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                        className="ml-auto rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-rose-500"
                        aria-label={d.common.delete}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1.2fr]">
                      <Select
                        value={row.categoryId}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    categoryId: e.target.value,
                                    categoryName:
                                      options.find((c) => c.id === e.target.value)?.name ??
                                      item.categoryName,
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        {options.map((category) => (
                          <option key={category.id} value={category.id}>
                            {localizeCategoryName(category.id, category.name, d)}
                          </option>
                        ))}
                      </Select>
                      <input
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/35"
                        value={row.description}
                        maxLength={200}
                        placeholder={d.smartInput.notePlaceholder}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, description: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {d.smartInput.totalExpense}{" "}
                <span className="num font-semibold text-foreground">{formatMoney(total, currency)}</span>
              </p>
              <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
                {d.smartInput.saveAll}
              </Button>
            </div>
          </div>
        ) : message ? (
          <p className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
