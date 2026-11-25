import type { CategoryDTO, ParsedTransaction, TransactionTypeValue } from "@/types";

type Rule = {
  category: string;
  type: TransactionTypeValue;
  keywords: string[];
};

const RULES: Rule[] = [
  {
    category: "Maosh",
    type: "INCOME",
    keywords: ["maosh", "oylik", "ish haqi", "avans", "salary"],
  },
  {
    category: "Frilans",
    type: "INCOME",
    keywords: ["frilans", "freelance", "sayt uchun", "loyiha uchun", "zakaz", "konsultatsiya"],
  },
  {
    category: "Investitsiya",
    type: "INCOME",
    keywords: ["investitsiya", "depozit", "foiz", "dividend", "aksiya"],
  },
  {
    category: "Sovg'a",
    type: "INCOME",
    keywords: ["sovg'a", "qaytarildi", "topildi", "bonus"],
  },
  {
    category: "Uy-joy",
    type: "EXPENSE",
    keywords: ["ijara", "uy-joy", "kvartira", "arenda", "kommunal"],
  },
  {
    category: "Transport",
    type: "EXPENSE",
    keywords: [
      "taksi",
      "taxi",
      "metro",
      "avtobus",
      "benzin",
      "yoqilg'i",
      "parkovka",
      "marshrutka",
      "yandex",
    ],
  },
  {
    category: "Kafe va restoran",
    type: "EXPENSE",
    keywords: ["tushlik", "kofe", "kafe", "restoran", "fast food", "ovqat", "nonushta", "kechki"],
  },
  {
    category: "Oziq-ovqat",
    type: "EXPENSE",
    keywords: [
      "bozor",
      "oziq",
      "supermarket",
      "meva",
      "sabzavot",
      "go'sht",
      "sut",
      "non",
      "tuxum",
      "market",
      "makaron",
    ],
  },
  {
    category: "Salomatlik",
    type: "EXPENSE",
    keywords: ["dorixona", "dori", "shifokor", "klinika", "tahlil", "tish", "kasalxona"],
  },
  {
    category: "Kiyim-kechak",
    type: "EXPENSE",
    keywords: ["kiyim", "poyabzal", "krossovka", "ko'ylak", "shim", "kurtka", "futbolka"],
  },
  {
    category: "Ta'lim",
    type: "EXPENSE",
    keywords: ["kurs", "kitob", "ta'lim", "seminar", "dars", "ingliz tili", "udemy"],
  },
  {
    category: "Ko'ngilochar",
    type: "EXPENSE",
    keywords: ["kino", "o'yin", "konsert", "muzey", "ko'ngil", "netflix", "steam"],
  },
];

const INCOME_HINTS = ["kirim", "daromad", "ishladim", "oldim maosh", "tushdi", "to'landi"];

const MONTHS: Record<string, number> = {
  yanvar: 0,
  fevral: 1,
  mart: 2,
  aprel: 3,
  may: 4,
  iyun: 5,
  iyul: 6,
  avgust: 7,
  sentabr: 8,
  oktabr: 9,
  noyabr: 10,
  dekabr: 11,
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[’‘ʻ`]/g, "'").replace(/\u00a0/g, " ");
}

function prepare(text: string) {
  let value = normalize(text);
  for (let i = 0; i < 3; i++) {
    value = value.replace(/(\d)[\s,.](\d{3})(?!\d)/g, "$1$2");
  }
  return value.replace(/\b\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?\b/g, " ");
}

function detectAmount(segment: string): number {
  const mln = segment.match(/(\d+(?:[.,]\d+)?)\s*(mln|million|млн)/);
  if (mln) return Math.round(parseFloat(mln[1].replace(",", ".")) * 1_000_000);

  const thousand = segment.match(/(\d+(?:[.,]\d+)?)\s*(ming|тыс\.?|k)(?![a-z])/);
  if (thousand) return Math.round(parseFloat(thousand[1].replace(",", ".")) * 1_000);

  const candidates = segment.match(/\d{3,}/g);
  if (!candidates) return 0;
  const numbers = candidates.map((n) => parseInt(n.replace(/\D/g, ""), 10)).filter(Number.isFinite);
  return numbers.length ? Math.max(...numbers) : 0;
}

function detectCategory(segment: string): Rule | undefined {
  let best: { rule: Rule; score: number } | undefined;
  for (const rule of RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (segment.includes(keyword)) score += keyword.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { rule, score };
  }
  return best?.rule;
}

function detectDate(segment: string): Date {
  const now = new Date();
  if (segment.includes("kecha")) {
    now.setDate(now.getDate() - 1);
    return now;
  }
  if (segment.includes("o'tgan hafta") || segment.includes("otgan hafta")) {
    now.setDate(now.getDate() - 7);
    return now;
  }
  if (segment.includes("o'tgan oy") || segment.includes("otgan oy")) {
    now.setMonth(now.getMonth() - 1);
    return now;
  }
  const monthMatch = segment.match(
    /\b(\d{1,2})\s+(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|oktabr|noyabr|dekabr)/,
  );
  if (monthMatch) {
    const day = parseInt(monthMatch[1], 10);
    const month = MONTHS[monthMatch[2]];
    if (month !== undefined && day >= 1 && day <= 31) {
      const candidate = new Date(now.getFullYear(), month, day, 12);
      if (candidate.getTime() > now.getTime() && month > now.getMonth()) {
        candidate.setFullYear(now.getFullYear() - 1);
      }
      return candidate;
    }
  }
  return now;
}

function resolveCategory(
  categories: CategoryDTO[],
  rule: Rule | undefined,
  type: TransactionTypeValue,
): CategoryDTO | undefined {
  if (rule) {
    const byName = categories.find(
      (c) => c.name.toLowerCase() === rule.category.toLowerCase() && c.type === rule.type,
    );
    if (byName) return byName;
  }
  return (
    categories.find((c) => c.type === type && c.name.toLowerCase().startsWith("boshqa")) ??
    categories.find((c) => c.type === type)
  );
}

function prettify(segment: string) {
  const text = segment.replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function parseTransactionsLocally(
  text: string,
  categories: CategoryDTO[],
): ParsedTransaction[] {
  const prepared = prepare(text);
  const segments = prepared
    .split(/[\n;]|\bva\b|\bkeyin\b|\bso'ng\b|\bhamda\b|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  const result: ParsedTransaction[] = [];

  for (const segment of segments) {
    const amount = detectAmount(segment);
    if (!amount || amount < 100) continue;

    const rule = detectCategory(segment);
    const hasIncomeHint = INCOME_HINTS.some((hint) => segment.includes(hint));
    const type: TransactionTypeValue =
      rule?.type === "INCOME" || hasIncomeHint ? "INCOME" : "EXPENSE";

    const category = resolveCategory(categories, rule, type);
    if (!category) continue;

    result.push({
      amount,
      type,
      categoryId: category.id,
      categoryName: category.name,
      description: prettify(segment).slice(0, 120),
      date: detectDate(segment).toISOString(),
    });
  }

  return result;
}
