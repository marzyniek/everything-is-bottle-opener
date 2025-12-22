export const dynamic = "force-dynamic";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/db";
import { attempts, users, comments, votes } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { DeleteButton } from "@/app/DeleteButton";
import { VoteButtons } from "@/app/VoteButtons";
import { CommentSection } from "@/app/CommentSection";

export default async function ToolPage({
  params,
}: {
  params: { toolName: string };
}) {
  const { userId } = await auth();
  const toolName = decodeURIComponent(params.toolName);

  // Fetch all attempts for this tool with vote counts and user votes
  const toolAttempts = await db
    .select({
      id: attempts.id,
      videoUrl: attempts.videoUrl,
      toolUsed: attempts.toolUsed,
      beverageBrand: attempts.beverageBrand,
      createdAt: attempts.createdAt,
      userId: attempts.userId,
      username: users.username,
      voteCount: sql<number>`CAST(COALESCE(SUM(${votes.value}), 0) AS INTEGER)`,
      userVote: userId
        ? sql<number | null>`MAX(CASE WHEN ${votes.userId} = ${userId} THEN ${votes.value} END)`
        : sql<number | null>`NULL`,
      commentCount: sql<number>`CAST(COUNT(DISTINCT ${comments.id}) AS INTEGER)`,
    })
    .from(attempts)
    .leftJoin(users, eq(attempts.userId, users.id))
    .leftJoin(votes, eq(attempts.id, votes.attemptId))
    .leftJoin(comments, eq(attempts.id, comments.attemptId))
    .where(eq(attempts.toolUsed, toolName))
    .groupBy(attempts.id, users.username)
    .orderBy(desc(attempts.createdAt));

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      {/* HEADER */}
      <header className="flex flex-col items-center justify-center py-8 border-b border-gray-800">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          {toolName} 🍾
        </h1>

        <div className="flex gap-4">
          <Link href="/attempts">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-full transition-all">
              ← Back to All Attempts
            </button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-full transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <UserButton />
              <Link href="/upload">
                <button className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-full transition-all flex items-center gap-2">
                  📹 Upload New Attempt
                </button>
              </Link>
            </div>
          </SignedIn>
        </div>
      </header>

      {/* ATTEMPTS */}
      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-300">
          {toolAttempts.length} Attempt{toolAttempts.length !== 1 ? "s" : ""}{" "}
          with {toolName}
        </h2>

        {toolAttempts.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">No attempts found for this tool.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {toolAttempts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl hover:border-gray-700 transition-colors"
              >
                {/* Video Player */}
                <div className="aspect-video bg-black relative">
                  <video
                    src={post.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {post.toolUsed}
                      </h3>
                      <p className="text-sm text-gray-400">
                        vs {post.beverageBrand}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {userId && post.userId === userId && (
                        <DeleteButton attemptId={post.id} />
                      )}
                    </div>
                  </div>

                  {/* User info */}
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm text-gray-400">
                    <span>by</span>
                    <span className="text-blue-400 font-semibold">
                      @{post.username || "Anonymous"}
                    </span>
                  </div>

                  {/* Vote buttons and comment count */}
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <VoteButtons
                      attemptId={post.id}
                      voteCount={post.voteCount}
                      userVote={post.userVote}
                    />
                    <div className="text-sm text-gray-400">
                      💬 {post.commentCount} comment
                      {post.commentCount !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Comments */}
                  <CommentSection attemptId={post.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
