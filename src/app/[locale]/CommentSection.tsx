"use client";

import { addComment } from "./actions";
import { useState, useTransition } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";

const MIN_COMMENT_LENGTH = 1;
const MAX_COMMENT_LENGTH = 500;

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  username: string | null;
};

export function CommentSection({ 
  attemptId, 
  comments 
}: { 
  attemptId: string;
  comments: Comment[];
}) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const t = useTranslations("comments");
  const tCommon = useTranslations("common");

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
        {showComments ? t("hide") : t("view")} {t("comments")}
      </button>

      {showComments && (
        <div className="mt-3">
          {/* Display existing comments */}
          {comments.length > 0 && (
            <div className="mb-4 space-y-3 max-h-64 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-blue-400 text-sm font-semibold">
                      @{c.username || tCommon("anonymous")}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add new comment form */}
          <form onSubmit={handleSubmit}>
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
        </div>
      )}
    </div>
  );
}
