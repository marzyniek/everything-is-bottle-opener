export const dynamic = "force-dynamic";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Link } from "@/i18n/routing";
import { db } from "@/db";
import { attempts, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export default async function AttemptsPage() {
  const t = await getTranslations("attempts");
  const tNav = await getTranslations("navigation");
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
    <main className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      {/* HEADER */}
      <header className="flex flex-col items-center justify-center py-6 md:py-8 border-b border-gray-800 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 text-center">
          {t("title")}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Link href="/">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-full transition-all w-full sm:w-auto">
              ← {tNav("backToFeed")}
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
                  📹 {t("uploadNewAttempt")}
                </button>
              </Link>
            </div>
          </SignedIn>
        </div>
      </header>

      {/* STATISTICS */}
      <section className="max-w-6xl mx-auto mt-6 sm:mt-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 sm:p-8 shadow-xl">
            <div className="text-4xl sm:text-5xl font-extrabold mb-2">{totalAttempts}</div>
            <div className="text-lg sm:text-xl text-blue-100">
              {t("totalBottlesOpened")}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 sm:p-8 shadow-xl">
            <div className="text-4xl sm:text-5xl font-extrabold mb-2">{uniqueTools}</div>
            <div className="text-lg sm:text-xl text-green-100">
              {t("differentToolsUsed")}
            </div>
          </div>
        </div>

        {/* TOOLS LIST */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-300">
          {t("browseByTool")}
        </h2>

        {Object.keys(toolGroups).length === 0 ? (
          <div className="text-center text-gray-500 py-12 sm:py-20">
            <p className="text-lg sm:text-xl">{t("noAttemptsYet")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(toolGroups)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([tool, toolAttempts]) => (
                <Link
                  key={tool}
                  href={`/attempts/tool/${encodeURIComponent(tool)}`}
                  className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">{tool}</h3>
                  <p className="text-gray-400 text-base sm:text-lg">
                    {toolAttempts.length}{" "}
                    {toolAttempts.length !== 1 ? t("attempts") : t("attempt")}
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
