import { auth } from "@/auth";

export type SessionUser = { id: string; email?: string | null; name?: string | null };

export async function requireUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

export function unauthorized() {
  return Response.json({ error: "Avtorizatsiya kerak" }, { status: 401 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function serverError(error: unknown) {
  console.error(error);
  return Response.json({ error: "Server xatosi. Keyinroq urinib ko'ring." }, { status: 500 });
}
