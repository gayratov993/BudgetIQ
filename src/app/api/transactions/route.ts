import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { transactionSchema } from "@/lib/validations";
import { toTransactionDTO } from "@/lib/analytics";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q")?.trim();
    if (from && Number.isNaN(new Date(from).getTime())) return badRequest("Boshlanish sanasi noto'g'ri");
    if (to && Number.isNaN(new Date(to).getTime())) return badRequest("Tugash sanasi noto'g'ri");

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
      ...(type === "INCOME" || type === "EXPENSE" ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
            },
          }
        : {}),
      ...(q ? { description: { contains: q, mode: "insensitive" as const } } : {}),
    };

    const [total, items, sums] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      }),
    ]);

    return Response.json({
      items: items.map(toTransactionDTO),
      total,
      page,
      pageSize,
      totals: {
        income: sums.find((s) => s.type === "INCOME")?._sum?.amount ?? 0,
        expense: sums.find((s) => s.type === "EXPENSE")?._sum?.amount ?? 0,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri");

    const { amount, type, categoryId, description, date } = parsed.data;
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });
    if (!category) return badRequest("Kategoriya topilmadi");
    if (category.type !== type) return badRequest("Kategoriya turi tranzaksiya turiga mos emas");

    const created = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type,
        categoryId,
        description: description || null,
        date: date ?? new Date(),
      },
      include: { category: true },
    });

    return Response.json(toTransactionDTO(created), { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
