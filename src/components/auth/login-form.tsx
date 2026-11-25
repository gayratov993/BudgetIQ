"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/components/i18n-provider";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const { d } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"credentials" | "google" | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading("credentials");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast({
          title: d.auth.loginFailed,
          description: d.auth.loginFailedDesc,
          tone: "error",
        });
        return;
      }
      toast({ title: d.auth.welcome, tone: "success" });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setLoading("google");
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">{d.auth.loginTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{d.auth.loginSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{d.auth.email}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder={d.auth.emailPlaceholder}
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="password">{d.auth.password}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" loading={loading === "credentials"}>
          {d.auth.loginButton} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {googleEnabled ? (
        <>
          <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {d.auth.or}
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            loading={loading === "google"}
            type="button"
          >
            {d.auth.google}
          </Button>
        </>
      ) : null}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {d.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {d.auth.registerLink}
        </Link>
      </p>
    </div>
  );
}
