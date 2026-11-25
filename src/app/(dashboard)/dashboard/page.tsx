import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  return <DashboardView name={session?.user?.name ?? "Foydalanuvchi"} />;
}

export const instant = false;