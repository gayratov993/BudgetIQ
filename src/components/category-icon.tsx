import {
  Banknote,
  Car,
  CircleEllipsis,
  Clapperboard,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  Shirt,
  ShoppingBasket,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Banknote,
  Car,
  CircleEllipsis,
  Clapperboard,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  Shirt,
  ShoppingBasket,
  TrendingUp,
  Wallet,
  Zap,
};

export function CategoryIcon({
  name,
  className,
  color,
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  const Icon = ICONS[name] ?? CircleEllipsis;
  return <Icon className={cn("h-4 w-4", className)} style={color ? { color } : undefined} />;
}
