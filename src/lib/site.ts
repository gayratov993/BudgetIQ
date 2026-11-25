const rawUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "http://localhost:3000";

export const siteConfig = {
  name: "BudgetIQ",
  url: rawUrl,
  title: "BudgetIQ — AI moliyaviy yordamchi",
  titleTemplate: "%s · BudgetIQ",
  description:
    "BudgetIQ — daromad va xarajatlarni kuzatish, oylik byudjetlar, vizual analitika, CSV eksport va AI moliyaviy maslahatchi. O'zbek, rus va ingliz tillarida bepul.",
  shortDescription:
    "AI asosidagi shaxsiy moliya ilovasi: tranzaksiyalar, byudjetlar, analitika va AI maslahatchi.",
  keywords: [
    "BudgetIQ",
    "moliyaviy yordamchi",
    "shaxsiy moliya",
    "byudjet ilovasi",
    "xarajatlar kuzatuvi",
    "AI moliyaviy maslahatchi",
    "personal finance app",
    "budget tracker",
    " expense tracker",
    "финансовый помощник",
    "учёт расходов",
  ],
  locale: "uz_UZ",
  alternateLocales: ["ru_RU", "en_US"],
  languages: ["uz", "ru", "en"],
  author: "Azizjon G'ayratov",
  category: "finance",
} as const;
