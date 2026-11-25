import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        monthlyBudget: true,
        createdAt: true,
      },
    });
    if (!dbUser) return unauthorized();
    return Response.json(dbUser);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        monthlyBudget: true,
      },
    });

    return Response.json(updated);
  } catch (error) {
    return serverError(error);
  }
}
