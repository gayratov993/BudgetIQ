import { prisma } from "@/lib/prisma";
import { badRequest, requireUser, serverError, unauthorized } from "@/lib/api-auth";

function escapeCsv(value: string | number | null) {
  const text = value === null ? "" : String(value);
  if (/[",;\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    if (from && Number.isNaN(new Date(from).getTime())) return badRequest("Boshlanish sanasi noto'g'ri");
    if (to && Number.isNaN(new Date(to).getTime())) return badRequest("Tugash sanasi noto'g'ri");

    const items = await prisma.transaction.findMany({
      where: {
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
      },
      include: { category: true },
      orderBy: { date: "asc" },
      take: 10000,
    });

    const lines = [
      ["Sana", "Turi", "Kategoriya", "Summa", "Izoh"].join(","),
      ...items.map((t) =>
        [
          escapeCsv(t.date.toISOString().slice(0, 10)),
          escapeCsv(t.type === "INCOME" ? "Daromad" : "Xarajat"),
          escapeCsv(t.category.name),
          escapeCsv(t.amount),
          escapeCsv(t.description ?? ""),
        ].join(","),
      ),
    ];

    const csv = "\uFEFF" + lines.join("\r\n");
    const filename = `budgetiq-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
