import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCIES = [
  { code: "UZS", symbol: "so'm" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["code"];

export const MONTHS_UZ = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
] as const;

export function formatMoney(amount: number, currency: string = "UZS") {
  const noDecimals = currency === "UZS";
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: noDecimals ? 0 : 2,
  }).format(amount);
  const meta = CURRENCIES.find((c) => c.code === currency);
  if (!meta) return `${formatted} ${currency}`;
  return meta.code === "UZS" ? `${formatted} so'm` : `${formatted} ${meta.symbol}`;
}

export function formatCompact(amount: number) {
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} mln`;
  if (Math.abs(amount) >= 1_000) return `${Math.round(amount / 1_000)} ming`;
  return String(amount);
}

export function formatDate(value: string | Date, withTime = false) {
  const d = typeof value === "string" ? new Date(value) : value;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  if (!withTime) return `${day}.${month}.${year}`;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hh}:${mm}`;
}

export function monthLabel(month: number, year?: number) {
  const name = MONTHS_UZ[month - 1] ?? "";
  return year ? `${name} ${year}` : name;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function initials(name?: string | null) {
  if (!name) return "IQ";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
