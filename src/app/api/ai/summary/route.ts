import { cookies } from "next/headers";
import { generateObject } from "ai";
import { z } from "zod";
import { requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { getDashboard, getFinancialSnapshot } from "@/lib/analytics";
import { buildInsights } from "@/lib/insights";
import { getAIModel, getAIProviderName } from "@/lib/ai";
import { formatMoney } from "@/lib/utils";
import { LOCALE_COOKIE, getDictionary, parseLocale } from "@/lib/i18n";

const insightSchema = z.object({
  insights: z
    .array(
      z.object({
        title: z.string().max(80),
        body: z.string().max(300),
        tone: z.enum(["good", "warning", "info"]),
      }),
    )
    .min(1)
    .max(4),
});

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
    const d = getDictionary(locale);
    const [snapshot, dashboard] = await Promise.all([
      getFinancialSnapshot(user.id),
      getDashboard(user.id),
    ]);

    const model = getAIModel();
    if (!model) {
      return Response.json({
        insights: buildInsights(dashboard, locale),
        provider: "local",
      });
    }

    try {
      const money = (v: number) => formatMoney(v, snapshot.currency);
      const { object } = await generateObject({
        model,
        schema: insightSchema,
        system: [
          "Sen shaxsiy moliya bo'yicha analitik maslahatchisan.",
          "Foydalanuvchi ma'lumotlari asosida 3-4 ta qisqa, aniq va amaliy xulosa ber.",
          `Har bir xulosa sarlavha va 1-2 jumladan iborat bo'lsin. Javobni ${d.ai.language} yoz.`,
          "tone: \"good\" — yaxshi holat, \"warning\" — xavf/limit, \"info\" — neytral kuzatuv.",
        ].join("\n"),
        prompt: [
          `Joriy oy: ${snapshot.currentMonth.label}`,
          `Daromad: ${money(snapshot.currentMonth.income)}`,
          `Xarajat: ${money(snapshot.currentMonth.expense)}`,
          `3 oylik jamg'arma darajasi: ${snapshot.totals.savingsRate}%`,
          "Kategoriyalar: " +
            snapshot.topExpenseCategories
              .map((c) => `${c.name} ${money(c.amount)} (${c.share}%)`)
              .join("; "),
          "Byudjetlar: " +
            snapshot.budgets
              .map((b) => `${b.name} ${b.pct}% (${money(b.spent)}/${money(b.limit)})`)
              .join("; "),
          "Oylik dinamika: " +
            snapshot.monthly
              .map((m) => `${m.label}: +${money(m.income)} / -${money(m.expense)}`)
              .join("; "),
        ].join("\n"),
      });

      return Response.json({
        insights: object.insights,
        provider: getAIProviderName() ?? "ai",
      });
    } catch (error) {
      console.error("[ai/summary]", error);
      return Response.json({
        insights: buildInsights(dashboard, locale),
        provider: "local",
      });
    }
  } catch (error) {
    return serverError(error);
  }
}
