import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/db/schema";
import { DEFAULT_CREDITS } from "@/types";

export async function upsertUser(email: string): Promise<User> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newUser] = await db
    .insert(users)
    .values({ email, creditsRemaining: DEFAULT_CREDITS })
    .returning();

  return newUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function deductCredit(userId: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.creditsRemaining <= 0) {
    return false;
  }

  await db
    .update(users)
    .set({
      creditsRemaining: user.creditsRemaining - 1,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return true;
}

export async function refundCredit(userId: string): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return;

  await db
    .update(users)
    .set({
      creditsRemaining: user.creditsRemaining + 1,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
