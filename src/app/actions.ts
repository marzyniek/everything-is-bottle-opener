"use server";

import { db } from "@/db";
import { attempts, users } from "@/db/schema"; // Import 'users' too
import { auth, currentUser } from "@clerk/nextjs/server"; // Import 'currentUser'
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

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
