"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { CURRENCIES, formatDate, formatMoney } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  monthlyBudget: number;
  createdAt?: string;
};

export function SettingsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<Profile>("/api/profile"),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-72" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return <SettingsForm profile={data} />;
}

function SettingsForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const { d } = useI18n();
  const [name, setName] = useState(profile.name ?? "");
  const [currency, setCurrency] = useState(profile.currency);
  const [monthlyBudget, setMonthlyBudget] = useState(
    profile.monthlyBudget ? String(profile.monthlyBudget) : "",
  );

  const mutation = useMutation({
    mutationFn: () =>
      api<Profile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          currency,
          monthlyBudget: Number(monthlyBudget || 0),
        }),
      }),
    onSuccess: () => {
      toast({ title: d.settings.saved, tone: "success" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      toast({
        title: d.common.saveFailed,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{d.settings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{d.settings.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" /> {d.settings.profile}
            </CardTitle>
            <CardDescription>{d.settings.profileDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="s-name">{d.settings.name}</Label>
                  <Input
                    id="s-name"
                    value={name}
                    minLength={2}
                    maxLength={60}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="s-email">{d.settings.email}</Label>
                  <Input id="s-email" value={profile.email} disabled />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="s-currency">{d.settings.currency}</Label>
                  <Select
                    id="s-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} — {item.symbol}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="s-budget">{d.settings.monthlyGoal}</Label>
                  <Input
                    id="s-budget"
                    inputMode="numeric"
                    placeholder="0"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value.replace(/[^\d]/g, ""))}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {Number(monthlyBudget) > 0
                      ? formatMoney(Number(monthlyBudget), currency)
                      : d.settings.notSet}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={mutation.isPending}>
                  <Save className="h-4 w-4" /> {d.common.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> {d.settings.account}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{d.settings.status}</span>
                <Badge tone="success">{d.settings.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{d.settings.registered}</span>
                <span>{profile.createdAt ? formatDate(profile.createdAt) : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="max-w-32 truncate font-mono text-[10px]">{profile.id}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" /> {d.settings.export}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {d.settings.exportDesc}
              </p>
              <a href="/api/export" className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-3.5 w-3.5" /> {d.settings.exportButton}
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{d.settings.techNoteTitle}</span>{" "}
            {d.settings.techNoteBefore}
            <code className="rounded bg-muted px-1">GOOGLE_GENERATIVE_AI_API_KEY</code>
            {d.settings.techNoteMiddle}
            <code className="rounded bg-muted px-1">OPENAI_API_KEY</code>
            {d.settings.techNoteAfter}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
