import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Tranzaksiyalar" };

export default async function TransactionsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { currency: true } })
    : null;

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <TransactionsView currency={user?.currency ?? "UZS"} />
    </Suspense>
  );
}

export const instant = false;