"use client";

import { useState, useEffect } from "react";
import { createAttempt, getExistingToolsAndBrands } from "../actions";
import { useTranslations } from "next-intl";
import { CompressingUploadDropzone } from "@/components/CompressingUploadDropzone";

export default function UploadPage() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [tools, setTools] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const t = useTranslations("upload");

  useEffect(() => {
    // Fetch existing tools and brands when component mounts
    getExistingToolsAndBrands()
      .then(data => {
        setTools(data.tools);
        setBrands(data.brands);
      })
      .catch(error => {
        console.error("Failed to fetch tools and brands:", error);
        // Continue without suggestions if fetch fails
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-950 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">{t("title")}</h1>

      {/* PHASE 1: The Video Upload */}
      {!videoUrl ? (
        <div className="w-full max-w-xl">
          <CompressingUploadDropzone
            onUploadComplete={(url) => {
              setVideoUrl(url);
              alert(t("videoUploaded"));
            }}
            onUploadError={(error: Error) => {
              alert(t("error", { message: error.message }));
            }}
            translations={{
              dropzone: t("dropzone"),
              compressing: t("compressing"),
              uploading: t("uploading"),
              error: t("error", { message: "" }),
            }}
          />
        </div>
      ) : (
        /* PHASE 2: The Details Form */
        <div className="w-full max-w-md bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg mb-4 sm:mb-6 bg-black"
          />

          <form action={createAttempt} className="flex flex-col gap-4">
            {/* HIDDEN INPUT: Pass the URL to the server action */}
            <input type="hidden" name="videoUrl" value={videoUrl} />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">
                {t("toolUsed")}
              </label>
              <input
                name="toolUsed"
                placeholder={t("toolUsedPlaceholder")}
                required
                list="tools-list"
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white text-base min-h-[44px]"
              />
              <datalist id="tools-list">
                {tools.map(tool => (
                  <option key={tool} value={tool} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">
                {t("beverageBrand")}
              </label>
              <input
                name="beverageBrand"
                placeholder={t("beverageBrandPlaceholder")}
                required
                list="brands-list"
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white text-base min-h-[44px]"
              />
              <datalist id="brands-list">
                {brands.map(brand => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-base"
            >
              {t("publish")}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
