"use client";

import { deleteAttempt } from "./actions";
import { Trash2 } from "lucide-react";

export function DeleteButton({ attemptId }: { attemptId: string }) {
  return (
    <form action={() => deleteAttempt(attemptId)}>
      <button
        type="submit"
        className="text-red-400 hover:text-red-300 transition-colors p-2"
        title="Delete post"
      >
        <Trash2 size={18} />
      </button>
    </form>
  );
}
