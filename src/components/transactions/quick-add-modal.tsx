"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/components/i18n-provider";
import { localizeCategoryName } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";
import type { CategoryDTO, TransactionTypeValue } from "@/types";

export function QuickAddModal({
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
  const [type, setType] = useState<TransactionTypeValue>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const filtered = categories.filter((c) => c.type === type);
  const effectiveCategoryId = filtered.some((c) => c.id === categoryId)
    ? categoryId
    : (filtered[0]?.id ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      api("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          type,
          categoryId: effectiveCategoryId,
          description,
          date: new Date(`${date}T12:00:00`).toISOString(),
        }),
      }),
    onSuccess: () => {
      toast({ title: d.quickAdd.added, tone: "success" });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      onSaved();
      onClose();
    },
    onError: (error) => {
      toast({
        title: d.quickAdd.failed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    },
  });

  const numericAmount = Number(amount);
  const valid = Number.isFinite(numericAmount) && numericAmount > 0 && Boolean(effectiveCategoryId);

  return (
    <Modal open={open} onClose={onClose} title={d.quickAdd.title} description={d.quickAdd.description}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) mutation.mutate();
        }}
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["EXPENSE", "INCOME"] as TransactionTypeValue[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={
                type === value
                  ? "rounded-lg bg-background py-2 text-xs font-semibold shadow-sm"
                  : "rounded-lg py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              }
            >
              {value === "EXPENSE" ? d.common.expense : d.common.income}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="qa-amount">{d.quickAdd.amount(currency)}</Label>
          <Input
            id="qa-amount"
            inputMode="numeric"
            autoFocus
            required
            placeholder={d.quickAdd.amountPlaceholder}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          />
          {numericAmount > 0 ? (
            <p className="mt-1 text-[11px] text-muted-foreground">{formatMoney(numericAmount, currency)}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="qa-category">{d.quickAdd.category}</Label>
            <Select
              id="qa-category"
              value={effectiveCategoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {filtered.length === 0 ? <option value="">{d.quickAdd.noCategory}</option> : null}
              {filtered.map((category) => (
                <option key={category.id} value={category.id}>
                  {localizeCategoryName(category.id, category.name, d)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="qa-date">{d.quickAdd.date}</Label>
            <Input id="qa-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label htmlFor="qa-description">{d.quickAdd.note}</Label>
          <Textarea
            id="qa-description"
            rows={2}
            maxLength={200}
            placeholder={d.quickAdd.notePlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-16"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            {d.common.cancel}
          </Button>
          <Button type="submit" disabled={!valid} loading={mutation.isPending}>
            {d.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
