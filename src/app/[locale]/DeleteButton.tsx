"use client";

import { deleteAttempt } from "./actions";
import { Trash2 } from "lucide-react";
import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";

export function DeleteButton({ attemptId }: { attemptId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const t = useTranslations("delete");

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      try {
        await deleteAttempt(attemptId);
      } catch {
        setError(t("error"));
        setTimeout(() => setError(""), 3000);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-400 hover:text-red-300 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
        title={t("title")}
      >
        <Trash2 size={20} />
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </>
  );
}
