import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { transactionBulkSchema } from "@/lib/validations";
import { toTransactionDTO } from "@/lib/analytics";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const parsed = transactionBulkSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri");

    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
    });
    const byId = new Map(categories.map((c) => [c.id, c]));

    const data = [];
    for (const item of parsed.data.transactions) {
      const category = byId.get(item.categoryId);
      if (!category || category.type !== item.type) continue;
      data.push({
        userId: user.id,
        amount: item.amount,
        type: item.type,
        categoryId: item.categoryId,
        description: item.description || null,
        date: item.date ?? new Date(),
      });
    }

    if (!data.length) return badRequest("Yaroqli tranzaksiya topilmadi");

    await prisma.transaction.createMany({ data });

    const created = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: data.length,
    });

    return Response.json({ count: data.length, items: created.map(toTransactionDTO) }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
