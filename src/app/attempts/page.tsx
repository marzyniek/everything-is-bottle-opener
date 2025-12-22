export const dynamic = "force-dynamic";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { db } from "@/db";
import { attempts, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export default async function AttemptsPage() {
  // Get all attempts
  const allAttempts = await db
    .select({
      id: attempts.id,
      videoUrl: attempts.videoUrl,
      toolUsed: attempts.toolUsed,
      beverageBrand: attempts.beverageBrand,
      createdAt: attempts.createdAt,
      userId: attempts.userId,
      username: users.username,
    })
    .from(attempts)
    .leftJoin(users, eq(attempts.userId, users.id))
    .orderBy(desc(attempts.createdAt));

  // Calculate statistics
  const totalAttempts = allAttempts.length;
  const uniqueTools = new Set(allAttempts.map((a) => a.toolUsed)).size;

  // Group attempts by tool
  const toolGroups = allAttempts.reduce((acc, attempt) => {
    if (!acc[attempt.toolUsed]) {
      acc[attempt.toolUsed] = [];
    }
    acc[attempt.toolUsed].push(attempt);
    return acc;
  }, {} as Record<string, typeof allAttempts>);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      {/* HEADER */}
      <header className="flex flex-col items-center justify-center py-8 border-b border-gray-800">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          All Attempts 🍾
        </h1>

        <div className="flex gap-4">
          <Link href="/">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-full transition-all">
              ← Back to Feed
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

      {/* STATISTICS */}
      <section className="max-w-6xl mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 shadow-xl">
            <div className="text-5xl font-extrabold mb-2">{totalAttempts}</div>
            <div className="text-xl text-blue-100">Total Bottles Opened</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-8 shadow-xl">
            <div className="text-5xl font-extrabold mb-2">{uniqueTools}</div>
            <div className="text-xl text-green-100">Different Tools Used</div>
          </div>
        </div>

        {/* TOOLS LIST */}
        <h2 className="text-3xl font-bold mb-6 text-gray-300">Browse by Tool</h2>

        {Object.keys(toolGroups).length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">No attempts yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(toolGroups)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([tool, toolAttempts]) => (
                <Link
                  key={tool}
                  href={`/attempts/tool/${encodeURIComponent(tool)}`}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {tool}
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {toolAttempts.length} attempt
                    {toolAttempts.length !== 1 ? "s" : ""}
                  </p>

                  {/* Show preview of first video */}
                  {toolAttempts[0] && (
                    <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={toolAttempts[0].videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    </div>
                  )}
                </Link>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
