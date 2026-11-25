import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { categorySchema } from "@/lib/validations";
import type { CategoryDTO } from "@/types";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    const data: CategoryDTO[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      userId: c.userId,
    }));

    return Response.json(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri");

    const exists = await prisma.category.findFirst({
      where: { name: parsed.data.name, type: parsed.data.type, userId: user.id },
    });
    if (exists) return Response.json({ error: "Bunday kategoriya allaqachon bor" }, { status: 409 });

    const created = await prisma.category.create({
      data: { ...parsed.data, userId: user.id },
    });

    return Response.json(
      {
        id: created.id,
        name: created.name,
        icon: created.icon,
        color: created.color,
        type: created.type,
        userId: created.userId,
      } satisfies CategoryDTO,
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
