import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { normalizeParsed, parseTransactionsWithAI } from "@/lib/ai";
import { parseTransactionsLocally } from "@/lib/parser";
import type { CategoryDTO } from "@/types";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (text.length < 3 || text.length > 1000) {
      return badRequest("Matn 3-1000 belgi oralig'ida bo'lsin");
    }

    const rows = await prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
    });
    const categories: CategoryDTO[] = rows.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      userId: c.userId,
    }));

    const aiResult = await parseTransactionsWithAI(text, categories);
    if (aiResult && aiResult.length > 0) {
      const validated = normalizeParsed(
        aiResult.map((t) => ({
          amount: t.amount,
          type: t.type,
          category: t.categoryName,
          description: t.description,
          date: t.date,
        })),
        categories,
      );
      return Response.json({ transactions: validated, provider: "ai" });
    }

    const local = parseTransactionsLocally(text, categories);
    if (!local.length) {
      return Response.json({
        transactions: [],
        provider: "local",
        message:
          "Tranzaksiya aniqlanmadi. Summani aniqroq yozing, masalan: \"Tushlikka 45 ming, taksiga 20 ming\".",
      });
    }

    return Response.json({ transactions: local, provider: "local" });
  } catch (error) {
    return serverError(error);
  }
}
