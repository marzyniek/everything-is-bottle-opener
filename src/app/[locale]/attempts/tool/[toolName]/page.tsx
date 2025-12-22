export const dynamic = "force-dynamic";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Link } from "@/i18n/routing";
import { db } from "@/db";
import { attempts, users, comments, votes } from "@/db/schema";
import { desc, eq, sql, inArray } from "drizzle-orm";
import { DeleteButton } from "../../../DeleteButton";
import { VoteButtons } from "../../../VoteButtons";
import { CommentSection } from "../../../CommentSection";
import { getTranslations } from "next-intl/server";
import { groupCommentsByAttempt } from "@/lib/utils";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ toolName: string }>;
}) {
  const { userId } = await auth();
  const awaitedParams = await params;
  const toolName = decodeURIComponent(awaitedParams.toolName);
  const t = await getTranslations("attempts");
  const tNav = await getTranslations("navigation");
  const tCommon = await getTranslations("common");
  const tHome = await getTranslations("home");

  // 1. Create a subquery to calculate vote totals safely
  const voteSq = db
    .select({
      attemptId: votes.attemptId,
      voteCount: sql<number>`sum(${votes.value})`.as("voteCount"),
      userVote: userId
        ? sql<number>`sum(case when ${votes.userId} = ${userId} then ${votes.value} else 0 end)`.as(
            "userVote"
          )
        : sql<number>`0`.as("userVote"),
    })
    .from(votes)
    .groupBy(votes.attemptId)
    .as("voteSq");

  // 2. Fetch all attempts for this tool, joining the pre-calculated vote subquery
  const toolAttempts = await db
    .select({
      id: attempts.id,
      videoUrl: attempts.videoUrl,
      toolUsed: attempts.toolUsed,
      beverageBrand: attempts.beverageBrand,
      createdAt: attempts.createdAt,
      userId: attempts.userId,
      username: users.username,
      // Pull data from the subquery
      voteCount: sql<number>`CAST(COALESCE(${voteSq.voteCount}, 0) AS INTEGER)`,
      userVote: sql<number>`CAST(COALESCE(${voteSq.userVote}, 0) AS INTEGER)`,
      commentCount: sql<number>`CAST(COUNT(DISTINCT ${comments.id}) AS INTEGER)`,
    })
    .from(attempts)
    .leftJoin(users, eq(attempts.userId, users.id))
    // Join our subquery instead of the raw votes table
    .leftJoin(voteSq, eq(attempts.id, voteSq.attemptId))
    .leftJoin(comments, eq(attempts.id, comments.attemptId))
    .where(eq(attempts.toolUsed, toolName))
    .groupBy(attempts.id, users.username, voteSq.voteCount, voteSq.userVote)
    .orderBy(desc(attempts.createdAt));

  // Fetch all comments for these attempts
  const attemptIds = toolAttempts.map((a) => a.id);
  const allComments =
    attemptIds.length > 0
      ? await db
          .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            attemptId: comments.attemptId,
            username: users.username,
          })
          .from(comments)
          .leftJoin(users, eq(comments.userId, users.id))
          .where(inArray(comments.attemptId, attemptIds))
          .orderBy(comments.createdAt)
      : [];

  // Group comments by attemptId for easy lookup
  const commentsByAttempt = groupCommentsByAttempt(allComments);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      {/* HEADER */}
      <header className="flex flex-col items-center justify-center py-6 md:py-8 border-b border-gray-800 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 text-center break-words max-w-full">
          {toolName} 🍾
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Link href="/attempts">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-full transition-all w-full sm:w-auto">
              ← {tNav("backToAllAttempts")}
            </button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-full transition-all w-full sm:w-auto">
                {tNav("signIn")}
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <UserButton />
              <Link href="/upload" className="w-full sm:w-auto">
                <button className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 w-full">
                  📹 {tHome("uploadNewAttempt")}
                </button>
              </Link>
            </div>
          </SignedIn>
        </div>
      </header>

      {/* ATTEMPTS */}
      <section className="max-w-4xl mx-auto mt-8 sm:mt-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-300">
          {toolAttempts.length}{" "}
          {toolAttempts.length !== 1 ? t("attempts") : t("attempt")}{" "}
          {t("attemptsWith")} {toolName}
        </h2>

        {toolAttempts.length === 0 ? (
          <div className="text-center text-gray-500 py-12 sm:py-20">
            <p className="text-lg sm:text-xl">{t("noAttemptsFoundForTool")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
                        {tCommon("vs")} {post.beverageBrand}
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
                    <span>{tCommon("by")}</span>
                    <span className="text-blue-400 font-semibold">
                      @{post.username || tCommon("anonymous")}
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
                      💬 {post.commentCount}{" "}
                      {post.commentCount !== 1
                        ? tHome("comments")
                        : tHome("comment")}
                    </div>
                  </div>

                  {/* Comments */}
                  <CommentSection
                    attemptId={post.id}
                    comments={commentsByAttempt[post.id] || []}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
