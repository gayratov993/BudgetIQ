import { z } from "zod";

const typeEnum = z.enum(["INCOME", "EXPENSE"]);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ism kamida 2 ta belgidan iborat bo'lsin").max(60),
  email: z.string().trim().toLowerCase().email("Email formati noto'g'ri"),
  password: z.string().min(8, "Parol kamida 8 ta belgi bo'lsin").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const transactionSchema = z.object({
  amount: z.coerce.number().int().positive("Summa 0 dan katta bo'lsin").max(1_000_000_000_000),
  type: typeEnum,
  categoryId: z.string().min(1, "Kategoriya tanlansin"),
  description: z.string().trim().max(200).optional(),
  date: z.coerce.date().optional(),
});

export const transactionBulkSchema = z.object({
  transactions: z
    .array(
      z.object({
        amount: z.coerce.number().int().positive(),
        type: typeEnum,
        categoryId: z.string().min(1),
        description: z.string().trim().max(200).optional().default(""),
        date: z.coerce.date().optional(),
      }),
    )
    .min(1, "Kamida bitta tranzaksiya kerak")
    .max(30),
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().int().min(0).max(1_000_000_000_000),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  currency: z.enum(["UZS", "USD", "EUR"]),
  monthlyBudget: z.coerce.number().int().min(0).max(1_000_000_000_000),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(40),
  type: typeEnum,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Rang HEX formatida bo'lsin"),
  icon: z.string().trim().min(1).max(40).default("CircleEllipsis"),
});

export const aiParseSchema = z.object({
  transactions: z.array(
    z.object({
      amount: z.number().int().positive(),
      type: typeEnum,
      category: z.string(),
      description: z.string().max(200).default(""),
      date: z.string().optional(),
    }),
  ),
});

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
