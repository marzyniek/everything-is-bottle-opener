"use client";

import { addComment } from "./actions";
import { useState, useTransition } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";

const MIN_COMMENT_LENGTH = 1;
const MAX_COMMENT_LENGTH = 500;

export function CommentSection({ attemptId }: { attemptId: string }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const t = useTranslations("comments");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedComment = comment.trim();
    
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      setError(t("errorEmpty"));
      return;
    }

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setError(t("errorTooLong", { max: MAX_COMMENT_LENGTH }));
      return;
    }

    startTransition(async () => {
      try {
        await addComment(attemptId, trimmedComment);
        setComment("");
        setShowComments(false);
      } catch (err) {
        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("logged in")) {
            setError(t("errorSignIn"));
          } else if (err.message.includes("not found")) {
            setError(t("errorNotFound"));
          } else if (err.message.includes("email")) {
            setError(t("errorProfile"));
          } else {
            setError(t("errorGeneric"));
          }
        } else {
          setError(t("errorGeneric"));
        }
      }
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-2"
      >
        <MessageSquare size={16} />
        {showComments ? t("hide") : t("add")} {t("comment")}
      </button>

      {showComments && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("writeComment")}
              maxLength={MAX_COMMENT_LENGTH}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending || !comment.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </form>
      )}
    </div>
  );
}
