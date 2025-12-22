"use client";

import { addVote } from "./actions";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";

export function VoteButtons({
  attemptId,
  voteCount,
  userVote,
}: {
  attemptId: string;
  voteCount: number;
  userVote: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const t = useTranslations("votes");

  const handleVote = (value: number) => {
    setError("");
    startTransition(async () => {
      try {
        await addVote(attemptId, value);
      } catch (err) {
        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("logged in")) {
            setError(t("errorSignIn"));
          } else if (err.message.includes("not found")) {
            setError(t("errorNotFound"));
          } else {
            setError(t("errorGeneric"));
          }
        } else {
          setError(t("errorGeneric"));
        }
        // Clear error after 3 seconds
        setTimeout(() => setError(""), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVote(1)}
          disabled={isPending}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
            userVote === 1
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={t("upvote")}
        >
          <ThumbsUp size={16} />
        </button>

        <span
          className={`font-bold text-lg ${
            voteCount > 0
              ? "text-green-400"
              : voteCount < 0
              ? "text-red-400"
              : "text-gray-400"
          }`}
        >
          {voteCount}
        </span>

        <button
          onClick={() => handleVote(-1)}
          disabled={isPending}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
            userVote === -1
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={t("downvote")}
        >
          <ThumbsDown size={16} />
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}
