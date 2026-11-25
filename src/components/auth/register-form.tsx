"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, User, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/components/i18n-provider";

export function RegisterForm() {
  const router = useRouter();
  const { d } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast({
        title: d.auth.passwordShort,
        description: d.auth.passwordShortDesc,
        tone: "error",
      });
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast({
          title: d.auth.accountReady,
          description: d.auth.accountReadyDesc,
          tone: "info",
        });
        router.push("/login");
        return;
      }
      toast({
        title: d.auth.accountCreated,
        description: d.auth.accountCreatedDesc,
        tone: "success",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: d.auth.registerFailed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">{d.auth.registerTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{d.auth.registerSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{d.auth.name}</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="name"
              required
              minLength={2}
              placeholder={d.auth.namePlaceholder}
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            placeholder={d.auth.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {d.auth.registerButton} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {d.auth.hasAccount}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {d.auth.loginLink}
        </Link>
      </p>
    </div>
  );
}
