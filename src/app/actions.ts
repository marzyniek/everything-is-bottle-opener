"use server";

import { db } from "@/db";
import { attempts, users, comments, votes } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createAttempt(formData: FormData) {
  const user = await currentUser(); // Get full user details from Clerk

  if (!user) throw new Error("You must be logged in");

  const videoUrl = formData.get("videoUrl") as string;
  const toolUsed = formData.get("toolUsed") as string;
  const beverageBrand = formData.get("beverageBrand") as string;

  if (!videoUrl || !toolUsed || !beverageBrand) {
    throw new Error("Missing fields");
  }

  // --- STEP 1: Ensure User Exists in DB ---
  // Try to find the user in our DB
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  // If they don't exist, create them locally
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.emailAddresses[0].emailAddress, // Clerk stores emails in an array
      username: user.firstName || "Anonymous", // Fallback if no name
    });
  }

  // --- STEP 2: Save the Attempt ---
  await db.insert(attempts).values({
    userId: user.id,
    videoUrl: videoUrl,
    toolUsed: toolUsed,
    beverageBrand: beverageBrand,
  });

  redirect("/");
}

export async function deleteAttempt(attemptId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("You must be logged in");

  // Verify the user owns the attempt before deleting
  const attempt = await db
    .select({ userId: attempts.userId })
    .from(attempts)
    .where(eq(attempts.id, attemptId));

  if (attempt.length === 0) {
    throw new Error("Attempt not found");
  }

  if (attempt[0].userId !== userId) {
    throw new Error("You can only delete your own posts");
  }

  // Delete the attempt
  await db.delete(attempts).where(eq(attempts.id, attemptId));

  redirect("/");
}

export async function addComment(attemptId: string, content: string) {
  const user = await currentUser();

  if (!user) throw new Error("You must be logged in");

  // Ensure user exists in DB
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      username: user.firstName || "Anonymous",
    });
  }

  await db.insert(comments).values({
    userId: user.id,
    attemptId: attemptId,
    content: content,
  });

  revalidatePath("/");
  revalidatePath("/attempts");
  revalidatePath(`/attempts/${attemptId}`);
}

export async function addVote(attemptId: string, value: number) {
  const user = await currentUser();

  if (!user) throw new Error("You must be logged in");

  // Ensure user exists in DB
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      username: user.firstName || "Anonymous",
    });
  }

  // Check if user already voted on this attempt
  const existingVote = await db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, user.id), eq(votes.attemptId, attemptId)));

  if (existingVote.length > 0) {
    // Update existing vote
    if (existingVote[0].value === value) {
      // If same value, remove vote (toggle off)
      await db
        .delete(votes)
        .where(and(eq(votes.userId, user.id), eq(votes.attemptId, attemptId)));
    } else {
      // If different value, update vote
      await db
        .update(votes)
        .set({ value: value })
        .where(and(eq(votes.userId, user.id), eq(votes.attemptId, attemptId)));
    }
  } else {
    // Create new vote
    await db.insert(votes).values({
      userId: user.id,
      attemptId: attemptId,
      value: value,
    });
  }

  revalidatePath("/");
  revalidatePath("/attempts");
  revalidatePath(`/attempts/${attemptId}`);
}
