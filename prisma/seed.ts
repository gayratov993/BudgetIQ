import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_CATEGORIES = [
  { id: "cat-food", name: "Oziq-ovqat", icon: "ShoppingBasket", color: "#34d399", type: "EXPENSE" },
  { id: "cat-transport", name: "Transport", icon: "Car", color: "#60a5fa", type: "EXPENSE" },
  { id: "cat-housing", name: "Uy-joy", icon: "House", color: "#a78bfa", type: "EXPENSE" },
  { id: "cat-utilities", name: "Kommunal", icon: "Zap", color: "#fbbf24", type: "EXPENSE" },
  { id: "cat-cafe", name: "Kafe va restoran", icon: "Coffee", color: "#fb923c", type: "EXPENSE" },
  { id: "cat-entertainment", name: "Ko'ngilochar", icon: "Clapperboard", color: "#f472b6", type: "EXPENSE" },
  { id: "cat-health", name: "Salomatlik", icon: "HeartPulse", color: "#f87171", type: "EXPENSE" },
  { id: "cat-clothes", name: "Kiyim-kechak", icon: "Shirt", color: "#22d3ee", type: "EXPENSE" },
  { id: "cat-education", name: "Ta'lim", icon: "GraduationCap", color: "#818cf8", type: "EXPENSE" },
  { id: "cat-other-expense", name: "Boshqa xarajat", icon: "CircleEllipsis", color: "#94a3b8", type: "EXPENSE" },
  { id: "cat-salary", name: "Maosh", icon: "Banknote", color: "#10b981", type: "INCOME" },
  { id: "cat-freelance", name: "Frilans", icon: "Laptop", color: "#38bdf8", type: "INCOME" },
  { id: "cat-investment", name: "Investitsiya", icon: "TrendingUp", color: "#c084fc", type: "INCOME" },
  { id: "cat-other-income", name: "Boshqa daromad", icon: "Wallet", color: "#a3e635", type: "INCOME" },
] as const;

async function main() {
  console.log("Kategoriyalar yaratilmoqda...");
  for (const category of SYSTEM_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      },
      create: { ...category, userId: null },
    });
  }
  console.log(`  ${SYSTEM_CATEGORIES.length} ta kategoriya tayyor.`);
  console.log("Seed tugadi.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
