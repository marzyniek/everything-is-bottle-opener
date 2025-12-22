"use client";

import { addVote } from "./actions";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useTransition, useState } from "react";

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

  const handleVote = (value: number) => {
    setError("");
    startTransition(async () => {
      try {
        await addVote(attemptId, value);
      } catch (err) {
        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("logged in")) {
            setError("Please sign in to vote");
          } else if (err.message.includes("not found")) {
            setError("This attempt no longer exists");
          } else {
            setError("Failed to vote. Please try again.");
          }
        } else {
          setError("Failed to vote. Please try again.");
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
          title="Upvote"
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
          title="Downvote"
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
