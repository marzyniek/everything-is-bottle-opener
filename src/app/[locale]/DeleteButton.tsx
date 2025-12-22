"use client";

import { deleteAttempt } from "./actions";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

export function DeleteButton({ attemptId }: { attemptId: string }) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("delete");

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAttempt(attemptId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-300 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
      title={t("title")}
    >
      <Trash2 size={18} />
    </button>
  );
}
