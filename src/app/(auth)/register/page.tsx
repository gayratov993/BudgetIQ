import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Ro'yxatdan o'tish",
  description: "BudgetIQ'da bepul hisob yarating: byudjet, analitika va AI maslahatchi.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return <RegisterForm />;
}

export const instant = false;