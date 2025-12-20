export const dynamic = "force-dynamic"; // <--- ADD THIS LINE

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { db } from "@/db";
import { attempts, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// Mark function as 'async' so we can fetch data
export default async function Home() {
  // 1. Fetch all attempts + the username of the person who uploaded it
  const allAttempts = await db
    .select({
      id: attempts.id,
      videoUrl: attempts.videoUrl,
      toolUsed: attempts.toolUsed,
      beverageBrand: attempts.beverageBrand,
      createdAt: attempts.createdAt,
      username: users.username, // <--- Get the username from the relation
    })
    .from(attempts)
    .leftJoin(users, eq(attempts.userId, users.id))
    .orderBy(desc(attempts.createdAt)); // Newest first

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      {/* --- HEADER SECTION --- */}
      <header className="flex flex-col items-center justify-center py-12 border-b border-gray-800">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Bottle Opener 🍾
        </h1>

        <div className="flex gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-full transition-all">
                Sign In to Post
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

      {/* --- FEED SECTION --- */}
      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-300">
          Latest Attempts
        </h2>

        {allAttempts.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">No attempts yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allAttempts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl hover:border-gray-700 transition-colors"
              >
                {/* 1. Video Player */}
                <div className="aspect-video bg-black relative">
                  <video
                    src={post.videoUrl}
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
                        vs {post.beverageBrand}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm text-gray-400">
                    <span>by</span>
                    <span className="text-blue-400 font-semibold">
                      @{post.username || "Anonymous"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
