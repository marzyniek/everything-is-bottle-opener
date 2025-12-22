"use client";

import { addComment } from "./actions";
import { useState, useTransition } from "react";
import { MessageSquare, Send } from "lucide-react";

export function CommentSection({ attemptId }: { attemptId: string }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    startTransition(async () => {
      await addComment(attemptId, comment);
      setComment("");
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-2"
      >
        <MessageSquare size={16} />
        {showComments ? "Hide" : "Add"} Comment
      </button>

      {showComments && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
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
        </form>
      )}
    </div>
  );
}
