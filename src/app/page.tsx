"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Download,
  HelpCircle,
  LineChart,
  Lock,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  Zap,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export default function LandingPage() {
  const { d } = useI18n();

  const features = [
    { icon: Sparkles, title: d.landing.featureSmartTitle, body: d.landing.featureSmartBody },
    { icon: Bot, title: d.landing.featureAiTitle, body: d.landing.featureAiBody },
    { icon: PieChart, title: d.landing.featureChartsTitle, body: d.landing.featureChartsBody },
    { icon: Target, title: d.landing.featureBudgetTitle, body: d.landing.featureBudgetBody },
    { icon: ShieldCheck, title: d.landing.featureSecurityTitle, body: d.landing.featureSecurityBody },
    { icon: Download, title: d.landing.featureExportTitle, body: d.landing.featureExportBody },
  ];

  const steps = [
    { title: d.landing.step1Title, body: d.landing.step1Body },
    { title: d.landing.step2Title, body: d.landing.step2Body },
    { title: d.landing.step3Title, body: d.landing.step3Body },
  ];

  const stats = [
    { value: d.landing.statHistoryValue, label: d.landing.statHistory },
    { value: d.landing.statCategoriesValue, label: d.landing.statCategories },
    { value: d.landing.statSmartValue, label: d.landing.statSmart },
    { value: d.landing.statLangValue, label: d.landing.statLang },
  ];

  const aiBullets = [
    d.landing.aiBullet1,
    d.landing.aiBullet2,
    d.landing.aiBullet3,
    d.landing.aiBullet4,
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      url: `${siteConfig.url}/`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description: d.landing.heroBody,
      inLanguage: [...siteConfig.languages],
      featureList: features.map((feature) => feature.title),
      offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
      publisher: { "@type": "Organization", name: siteConfig.name, url: `${siteConfig.url}/` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: d.landing.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5">
          <Link href="/">
            <Brand />
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              {d.landing.navFeatures}
            </a>
            <a href="#how" className="transition hover:text-foreground">
              {d.landing.navHow}
            </a>
            <a href="#ai" className="transition hover:text-foreground">
              {d.landing.navAi}
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              {d.landing.navFaq}
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                {d.landing.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                {d.landing.start} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <Badge tone="success" className="mb-5 px-3 py-1">
              <Sparkles className="h-3 w-3" /> {d.landing.heroBadge}
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {d.landing.heroTitle1}
              <span className="block bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
                {d.landing.heroTitle2}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              {d.landing.heroBody}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  {d.landing.createAccount} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {d.landing.login}
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {d.landing.noCard}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {d.landing.aiReady}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {d.landing.multilingual}
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up lg:pl-4 [animation-delay:120ms]">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-500/20 via-transparent to-teal-400/15 blur-2xl" />
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/10">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs font-medium text-muted-foreground">{d.landing.previewMonth}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                  <LineChart className="h-3 w-3" /> +12.4%
                </span>
              </div>
              <p className="num px-2 text-3xl font-semibold tracking-tight">18 420 000</p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {d.landing.previewIncome}
                  </p>
                  <p className="num mt-1 text-sm font-semibold text-emerald-500">5 800 000</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {d.landing.previewExpense}
                  </p>
                  <p className="num mt-1 text-sm font-semibold text-rose-400">3 940 000</p>
                </div>
              </div>

              <div className="mt-4 flex h-28 items-end gap-2 rounded-xl border border-border bg-background p-3">
                {[42, 64, 52, 78, 58, 86, 72, 94, 66, 88, 74, 100].map((height, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/40 to-emerald-400"
                      style={{ height: `${height * 0.8}px` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                  <Sparkles className="h-3 w-3" /> {d.landing.previewInsightTitle}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {d.landing.previewInsightBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/40">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-5 py-8 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label}>
                <p className="text-xl font-semibold tracking-tight">{item.value}</p>
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl">
            <Badge tone="info" className="mb-4">
              <Zap className="h-3 w-3" /> {d.landing.featuresBadge}
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">{d.landing.featuresTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {d.landing.featuresBody}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-border/70 bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-semibold tracking-tight">{d.landing.howTitle}</h2>
              <p className="text-xs text-muted-foreground">{d.landing.howTime}</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="relative rounded-2xl border border-border bg-background p-5">
                  <span className="text-4xl font-semibold text-emerald-500/20">0{index + 1}</span>
                  <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ai" className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <Badge tone="success" className="mb-4">
              <Bot className="h-3 w-3" /> {d.landing.aiBadge}
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">{d.landing.aiTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.landing.aiBody}</p>
            <ul className="mt-6 space-y-3">
              {aiBullets.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
                <Bot className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold">BudgetIQ Assistant</p>
                <p className="flex items-center gap-1 text-[10px] text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {d.landing.aiOnline}
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-3 text-xs">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 px-3.5 py-2.5 text-emerald-950">
                {d.landing.demoQuestion1}
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 leading-relaxed text-muted-foreground">
                {d.landing.demoAnswer1}
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 px-3.5 py-2.5 text-emerald-950">
                {d.landing.demoQuestion2}
              </div>
              <div className="flex items-center gap-1.5 px-2 text-[10px] text-muted-foreground">
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:240ms]" />
                </span>
                {d.landing.aiTyping}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-border/70">
          <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:py-20">
            <Badge tone="info" className="mb-4">
              <HelpCircle className="h-3 w-3" /> {d.landing.navFaq}
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">{d.landing.faqTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.landing.faqBody}</p>
            <div className="mt-8 space-y-3">
              {d.landing.faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-emerald-500/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                    {item.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 p-8 text-center sm:p-12">
            <Wallet className="mx-auto mb-4 h-8 w-8 text-emerald-500" />
            <h2 className="text-balance text-3xl font-semibold tracking-tight">{d.landing.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{d.landing.ctaBody}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  {d.landing.ctaButton} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {d.landing.login}
                </Button>
              </Link>
            </div>
            <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> {d.landing.ctaSecurity}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
          <Brand />
          <p>{d.landing.footer}</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              {d.landing.footerLogin}
            </Link>
            <Link href="/register" className="hover:text-foreground">
              {d.landing.footerRegister}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
