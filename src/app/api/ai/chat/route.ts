import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { getFinancialSnapshot } from "@/lib/analytics";
import { buildLocalAdvisorAnswer, getAIProviderName, streamAdvisor } from "@/lib/ai";
import { chatSchema } from "@/lib/validations";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Xabar formati noto'g'ri" }, { status: 400 });
    }

    const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currency: true },
    });
    if (!dbUser) return unauthorized();

    const snapshot = await getFinancialSnapshot(user.id);
    const lastUserMessage = [...parsed.data.messages].reverse().find((m) => m.role === "user");

    const streamed = await streamAdvisor(parsed.data.messages, snapshot, locale);
    if (streamed) {
      return new Response(streamed.body, {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-ai-mode": "ai",
          "x-ai-provider": getAIProviderName() ?? "AI",
        },
      });
    }

    const answer = buildLocalAdvisorAnswer(lastUserMessage?.content ?? "", snapshot, locale);
    return new Response(answer, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-ai-mode": "local",
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
