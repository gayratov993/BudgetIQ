import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { budgetSchema } from "@/lib/validations";
import { percent } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const now = new Date();
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
    const year = Number(searchParams.get("year") ?? now.getFullYear());
    if (!Number.isInteger(month) || month < 1 || month > 12) return badRequest("Oy noto'g'ri");
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return badRequest("Yil noto'g'ri");

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const [budgets, categories, sums] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: user.id, year, month },
        include: { category: true },
        orderBy: { amount: "desc" },
      }),
      prisma.category.findMany({
        where: { type: "EXPENSE", OR: [{ userId: null }, { userId: user.id }] },
        orderBy: { name: "asc" },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId: user.id, type: "EXPENSE", date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ]);

    const spentMap = new Map(sums.map((s) => [s.categoryId, s._sum.amount ?? 0]));

    return Response.json({
      month,
      year,
      budgets: budgets.map((b) => {
        const spent = spentMap.get(b.categoryId) ?? 0;
        return {
          id: b.id,
          categoryId: b.categoryId,
          name: b.category.name,
          color: b.category.color,
          icon: b.category.icon,
          limit: b.amount,
          spent,
          pct: percent(spent, b.amount),
        };
      }),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        type: c.type,
        userId: c.userId,
        spent: spentMap.get(c.id) ?? 0,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri");
    const { categoryId, amount, month, year } = parsed.data;

    const category = await prisma.category.findFirst({
      where: { id: categoryId, type: "EXPENSE", OR: [{ userId: null }, { userId: user.id }] },
    });
    if (!category) return badRequest("Xarajat kategoriyasi topilmadi");

    if (amount <= 0) {
      await prisma.budget.deleteMany({ where: { userId: user.id, categoryId, month, year } });
      return Response.json({ ok: true, deleted: true });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: { userId: user.id, categoryId, month, year },
      },
      update: { amount },
      create: { userId: user.id, categoryId, amount, month, year },
    });

    return Response.json({ ok: true, id: budget.id, amount: budget.amount });
  } catch (error) {
    return serverError(error);
  }
}
