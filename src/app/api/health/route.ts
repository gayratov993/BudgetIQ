export async function GET() {
  return Response.json({
    ok: true,
    app: "BudgetIQ",
    time: new Date().toISOString(),
    ai: Boolean(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.OPENAI_API_KEY,
    ),
  });
}
