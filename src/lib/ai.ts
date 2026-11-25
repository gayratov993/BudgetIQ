import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateObject, streamText, type ModelMessage } from "ai";
import type { CategoryDTO, ParsedTransaction } from "@/types";
import type { FinancialSnapshot } from "./analytics";
import { formatMoney } from "./utils";
import { aiParseSchema } from "./validations";
import {
  DEFAULT_LOCALE,
  getDictionary,
  localizeCategoryName,
  type Locale,
} from "./i18n";

export function getAIModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.AI_MODEL || "gemini-3.5-flash-lite");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai(process.env.AI_MODEL || "gpt-4o-mini");
  }
  return null;
}

export function getAIProviderName() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "Gemini";
  if (process.env.OPENAI_API_KEY) return "OpenAI";
  return null;
}

type RawParsed = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  date?: string;
};

function resolveCategory(categories: CategoryDTO[], name: string, type: "INCOME" | "EXPENSE") {
  const normalized = name.trim().toLowerCase();
  const exact = categories.find((c) => c.name.toLowerCase() === normalized);
  if (exact) return exact;
  const partial = categories.find(
    (c) => normalized.length > 2 && c.name.toLowerCase().includes(normalized),
  );
  if (partial) return partial;
  const fallback = categories.find(
    (c) => c.type === type && c.name.toLowerCase().startsWith("boshqa"),
  );
  return fallback ?? categories.find((c) => c.type === type);
}

export function normalizeParsed(
  items: RawParsed[],
  categories: CategoryDTO[],
): ParsedTransaction[] {
  return items
    .map((item) => {
      const type = item.type === "INCOME" ? "INCOME" : "EXPENSE";
      const category = resolveCategory(categories, item.category ?? "", type);
      if (!category) return null;
      const parsedDate = item.date ? new Date(item.date) : new Date();
      const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      return {
        amount: Math.round(item.amount),
        type,
        categoryId: category.id,
        categoryName: category.name,
        description: (item.description || "").slice(0, 200),
        date: date.toISOString(),
      } satisfies ParsedTransaction;
    })
    .filter((x): x is ParsedTransaction => Boolean(x) && (x?.amount ?? 0) > 0);
}

export async function parseTransactionsWithAI(
  text: string,
  categories: CategoryDTO[],
): Promise<ParsedTransaction[] | null> {
  const model = getAIModel();
  if (!model) return null;

  const categoryList = categories
    .map((c) => `- ${c.name} (${c.type === "INCOME" ? "DAROMAD" : "XARAJAT"})`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model,
      schema: aiParseSchema,
      system: [
        "Sen moliyaviy tranzaksiyalarni matndan ajratib oluvchi yordamchisan.",
        "Faqat foydalanuvchi aytgan tranzaksiyalarni ajrat. Summani so'mda butun son sifatida qaytar.",
        "\"ming\" = 1000, \"mln\"/\"million\" = 1000000. Kategoriyani berilgan ro'yxatdan tanla.",
        "Agar daromad yoki xarajat ekanligi aniq bo'lmasa, EXPENSE deb hisobla.",
        "Bugungi sana: " + new Date().toISOString().slice(0, 10),
      ].join("\n"),
      prompt: `Kategoriyalar:\n${categoryList}\n\nMatn:\n"""${text}"""`,
    });

    return normalizeParsed(object.transactions, categories);
  } catch (error) {
    console.error("[ai/parse]", error);
    return null;
  }
}

function snapshotToPrompt(snapshot: FinancialSnapshot, currency: string) {
  const money = (v: number) => formatMoney(v, currency);
  return [
    `Davr: ${snapshot.period.from} — ${snapshot.period.to}`,
    `Jami daromad: ${money(snapshot.totals.income)}`,
    `Jami xarajat: ${money(snapshot.totals.expense)}`,
    `Jamg'arma: ${money(snapshot.totals.savings)} (${snapshot.totals.savingsRate}%)`,
    `Joriy oy (${snapshot.currentMonth.label}): daromad ${money(snapshot.currentMonth.income)}, xarajat ${money(snapshot.currentMonth.expense)}`,
    "Oylik dinamika: " +
      snapshot.monthly
        .map((m) => `${m.label}: kirim ${money(m.income)}, chiqim ${money(m.expense)}`)
        .join("; "),
    "Eng katta xarajat kategoriyalari: " +
      snapshot.topExpenseCategories
        .map((c) => `${c.name} ${money(c.amount)} (${c.share}%)`)
        .join("; "),
    "Byudjetlar: " +
      snapshot.budgets
        .map((b) => `${b.name} ${money(b.spent)}/${money(b.limit)} (${b.pct}%)`)
        .join("; "),
  ].join("\n");
}

export function buildAdvisorSystemPrompt(
  snapshot: FinancialSnapshot,
  locale: Locale = DEFAULT_LOCALE,
) {
  const d = getDictionary(locale);
  return [
    "Sen BudgetIQ platformasining professional moliyaviy maslahatchisisan.",
    "Foydalanuvchining moliyaviy ma'lumotlari quyida berilgan:",
    "---",
    snapshotToPrompt(snapshot, snapshot.currency),
    "---",
    "Qoidalar:",
    "1. Javob aniq, raqamlarga asoslangan, qisqa (maksimum 6-8 jumla) va amaliy bo'lsin.",
    "2. Faqat berilgan ma'lumotlarga tayan; mavjud bo'lmagan raqamlarni o'ylab topma.",
    `3. Javobni ${d.ai.language} yoz.`,
    "4. Byudjetdan oshib ketgan kategoriyalarni va tejash imkoniyatlarini ta'kidla.",
    "5. Investitsiya yoki kredit bo'yicha qat'iy kafolat berma, umumiy maslahat ber.",
  ].join("\n");
}

export async function streamAdvisor(
  messages: { role: "user" | "assistant"; content: string }[],
  snapshot: FinancialSnapshot,
  locale: Locale = DEFAULT_LOCALE,
) {
  const model = getAIModel();
  if (!model) return null;

  const result = streamText({
    model,
    system: buildAdvisorSystemPrompt(snapshot, locale),
    messages: messages as ModelMessage[],
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}

export function buildLocalAdvisorAnswer(
  question: string,
  snapshot: FinancialSnapshot,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const d = getDictionary(locale);
  const t = d.ai;
  const q = question.toLowerCase();
  const money = (v: number) => formatMoney(v, snapshot.currency);
  const label = (b: { categoryId: string; name: string }) =>
    localizeCategoryName(b.categoryId, b.name, d);
  const top = snapshot.topExpenseCategories[0];
  const over = snapshot.budgets.filter((b) => b.pct >= 100);
  const near = snapshot.budgets.filter((b) => b.pct >= 80 && b.pct < 100);

  if (/byudjet|limit|osh|бюджет|лимит|budget/.test(q)) {
    if (over.length) {
      return t.budgetOver(over.map((b) => `${label(b)} (${b.pct}%)`).join(", "));
    }
    if (near.length) {
      return t.budgetNear(near.map((b) => `${label(b)} (${b.pct}%)`).join(", "));
    }
    return t.budgetOk;
  }

  const category = snapshot.topExpenseCategories.find((c) => {
    const names = [c.name, label(c)].map((n) => n.toLowerCase().split(" ")[0]);
    return names.some((n) => n.length > 2 && q.includes(n));
  });
  if (category) {
    return t.category(
      label(category),
      money(category.amount),
      category.share,
      money(snapshot.currentMonth.expense),
    );
  }

  if (/tej|jamg'ar|yig'|сбереж|накоп|отклад|sav|emergency/.test(q)) {
    const advice = snapshot.totals.savingsRate >= 20 ? t.savingsGood : t.savingsLow;
    return t.savingsLine(money(snapshot.totals.savings), snapshot.totals.savingsRate, advice);
  }

  return t.summary(
    money(snapshot.totals.income),
    money(snapshot.totals.expense),
    money(snapshot.totals.savings),
    top ? t.topLine(label(top), money(top.amount), top.share) : "",
    over.length ? t.overLine(over.map((b) => label(b)).join(", ")) : "",
    t.hint,
  );
}
