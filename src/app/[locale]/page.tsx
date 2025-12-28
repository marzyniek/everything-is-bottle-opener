export const dynamic = "force-dynamic"; // <--- ADD THIS LINE

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Link } from "@/i18n/routing";
import { db } from "@/db";
import { attempts, users, comments, votes } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { DeleteButton } from "./DeleteButton";
import { VoteButtons } from "./VoteButtons";
import { CommentSection } from "./CommentSection";
import { getTranslations } from "next-intl/server";
import { groupCommentsByAttempt } from "@/lib/utils";

// Mark function as 'async' so we can fetch data
export default async function Home() {
  // Get the current user ID
  const { userId } = await auth();
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("navigation");

  // Fetch all attempts + the username of the person who uploaded it + vote counts
  const voteSq = db
    .select({
      attemptId: votes.attemptId,
      // Sum of all votes for the attempt
      voteCount: sql<number>`sum(${votes.value})`.as("voteCount"),
      // The current user's vote (if logged in)
      userVote: userId
        ? sql<number>`sum(case when ${votes.userId} = ${userId} then ${votes.value} else 0 end)`.as(
            "userVote"
          )
        : sql<number>`0`.as("userVote"),
    })
    .from(votes)
    .groupBy(votes.attemptId)
    .as("voteSq"); // Alias for the subquery

  // 2. Fetch attempts, joining the pre-calculated vote subquery
  const allAttempts = await db
    .select({
      id: attempts.id,
      videoUrl: attempts.videoUrl,
      toolUsed: attempts.toolUsed,
      beverageBrand: attempts.beverageBrand,
      createdAt: attempts.createdAt,
      userId: attempts.userId,
      username: users.username,
      // Pull data from the subquery, defaulting to 0 if no votes exist
      voteCount: sql<number>`coalesce(${voteSq.voteCount}, 0)`,
      userVote: sql<number>`coalesce(${voteSq.userVote}, 0)`,
      // Count distinct comments to ensure accuracy
      commentCount: sql<number>`count(distinct ${comments.id})`,
    })
    .from(attempts)
    .leftJoin(users, eq(attempts.userId, users.id))
    // Join our subquery instead of the raw votes table
    .leftJoin(voteSq, eq(attempts.id, voteSq.attemptId))
    .leftJoin(comments, eq(attempts.id, comments.attemptId))
    // We must group by the new subquery columns as well to avoid SQL errors
    .groupBy(attempts.id, users.username, voteSq.voteCount, voteSq.userVote)
    .orderBy(desc(attempts.createdAt));

  // Fetch all comments for all attempts to pass to CommentSection
  const allComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      attemptId: comments.attemptId,
      username: users.username,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .orderBy(comments.createdAt);

  // Group comments by attemptId for easy lookup
  const commentsByAttempt = groupCommentsByAttempt(allComments);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      {/* --- HEADER SECTION --- */}
      <header className="flex flex-col items-center justify-center py-6 md:py-12 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left px-4">
          <span className="text-sm sm:text-base whitespace-nowrap">{t("subtitle1")}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            {t("title")}
          </h1>
          <span className="text-sm sm:text-base whitespace-nowrap">{t("subtitle2")}</span>
        </div>
        <div className="flex flex-col items-center justify-center mb-4">
          <h2 className="text-base sm:text-lg text-gray-400 mt-4 text-center px-4">{t("description")}</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full px-4 sm:w-auto">
          <Link href="/attempts">
            <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-full transition-all w-full sm:w-auto">
              {t("viewAllAttempts")}
            </button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-transparent border border-blue-500 text-white font-bold px-6 py-3 rounded-full transition-all w-full sm:w-auto">
                {tNav("signInToPost")}
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <UserButton />
              <Link href="/upload" className="w-full sm:w-auto">
                <button className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 w-full">
                  {t("uploadNewAttempt")}
                </button>
              </Link>
            </div>
          </SignedIn>
        </div>
      </header>

      {/* --- FEED SECTION --- */}
      <section className="max-w-4xl mx-auto mt-8 md:mt-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-300">
          {t("latestAttempts")}
        </h2>

        {allAttempts.length === 0 ? (
          <div className="text-center text-gray-500 py-12 sm:py-20">
            <p className="text-lg sm:text-xl">{t("noAttemptsYet")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {allAttempts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl hover:border-gray-700 transition-colors"
              >
                {/* 1. Video Player */}
                <div className="aspect-video bg-black relative">
                  <video
                    src={`https://stream.mux.com/${post.videoUrl}.m3u8`}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                </div>

                {/* 2. Details */}
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
                      {post.commentCount !== 1 ? t("comments") : t("comment")}
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
