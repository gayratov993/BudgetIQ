import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { transactionSchema } from "@/lib/validations";
import { toTransactionDTO } from "@/lib/analytics";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    if (!existing) return Response.json({ error: "Tranzaksiya topilmadi" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const parsed = transactionSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri");

    const data = parsed.data;
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, OR: [{ userId: null }, { userId: user.id }] },
      });
      if (!category) return badRequest("Kategoriya topilmadi");
      if (data.type && category.type !== data.type) return badRequest("Kategoriya turi mos emas");
      if (!data.type && category.type !== existing.type) return badRequest("Kategoriya turi mos emas");
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.categoryId ? { categoryId: data.categoryId } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.date ? { date: data.date } : {}),
      },
      include: { category: true },
    });

    return Response.json(toTransactionDTO(updated));
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const deleted = await prisma.transaction.deleteMany({ where: { id, userId: user.id } });
    if (!deleted.count) return Response.json({ error: "Tranzaksiya topilmadi" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
