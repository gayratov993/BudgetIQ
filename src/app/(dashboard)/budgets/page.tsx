import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BudgetsView } from "@/components/budgets/budgets-view";

export const metadata = { title: "Byudjetlar" };

export default async function BudgetsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { currency: true } })
    : null;

  return <BudgetsView currency={user?.currency ?? "UZS"} />;
}

export const instant = false;