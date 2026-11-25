import { cookies } from "next/headers";
import { requireUser, serverError, unauthorized } from "@/lib/api-auth";
import { getDashboard } from "@/lib/analytics";
import { buildInsights } from "@/lib/insights";
import { getAIProviderName } from "@/lib/ai";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
    const data = await getDashboard(user.id);
    return Response.json({
      ...data,
      insights: buildInsights(data, locale),
      aiProvider: getAIProviderName(),
    });
  } catch (error) {
    return serverError(error);
  }
}
