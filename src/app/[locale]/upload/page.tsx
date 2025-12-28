"use client";

import MuxUploader from "@mux/mux-uploader-react";
import MuxPlayer from "@mux/mux-player-react";
import { useState, useEffect } from "react";
import { createAttempt, getExistingToolsAndBrands } from "../actions";
import { useTranslations } from "next-intl";

// Constants for asset polling
const MAX_POLLING_ATTEMPTS = 30; // 30 seconds max
const POLLING_INTERVAL_MS = 1000; // 1 second between polls

export default function UploadPage() {
  const [playbackId, setPlaybackId] = useState<string>("");
  const [uploadId, setUploadId] = useState<string>("");
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [tools, setTools] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const t = useTranslations("upload");

  useEffect(() => {
    // Fetch existing tools and brands when component mounts
    getExistingToolsAndBrands()
      .then((data) => {
        setTools(data.tools);
        setBrands(data.brands);
      })
      .catch((error) => {
        console.error("Failed to fetch tools and brands:", error);
        // Continue without suggestions if fetch fails
      });
  }, []);

  // Create upload URL when component mounts
  useEffect(() => {
    const createUpload = async () => {
      try {
        const response = await fetch("/api/mux/upload", {
          method: "POST",
        });
        const data = await response.json();

        if (response.ok) {
          setUploadUrl(data.url);
          setUploadId(data.uploadId);
        } else {
          console.error("Failed to create upload:", data.error);
          setUploadError(data.error || "Failed to create upload");
        }
      } catch (error) {
        console.error("Error creating upload:", error);
        setUploadError("Failed to initialize upload");
      }
    };

    createUpload();
  }, []);

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadError("");
  };

  const handleUploadSuccess = async () => {
    setIsUploading(false);

    // Poll for the asset to be ready
    let attempts = 0;

    const checkAsset = async () => {
      try {
        const response = await fetch(`/api/mux/asset?uploadId=${uploadId}`);
        const data = await response.json();

        if (data.status === "ready" && data.playbackId) {
          setPlaybackId(data.playbackId);
          //      alert(t("videoUploaded"));
        } else if (attempts < MAX_POLLING_ATTEMPTS) {
          attempts++;
          setTimeout(checkAsset, POLLING_INTERVAL_MS);
        } else {
          setUploadError("Video processing timed out. Please try again.");
        }
      } catch (error) {
        console.error("Error checking asset:", error);
        setUploadError("Failed to process video");
      }
    };

    checkAsset();
  };

  const handleUploadError = () => {
    setIsUploading(false);
    setUploadError("Upload failed");
    alert(t("error", { message: "Upload failed" }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-950 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
        {t("title")}
      </h1>

      {/* PHASE 1: The Video Upload */}
      {!playbackId ? (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 sm:p-10 bg-gray-900/50 w-full max-w-xl">
          {uploadError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
              {uploadError}
            </div>
          )}
          {uploadUrl && (
            <MuxUploader
              endpoint={uploadUrl}
              onUploadStart={handleUploadStart}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          )}
          {isUploading && (
            <div className="mt-4 text-center text-gray-400">
              Uploading video...
            </div>
          )}
        </div>
      ) : (
        /* PHASE 2: The Details Form */
        <div className="w-full max-w-md bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800">
          {/* Display video using Mux player */}
          <div className="w-full rounded-lg mb-4 sm:mb-6 bg-black">
            <MuxPlayer
              playbackId={playbackId}
              metadata={{
                video_title: "Bottle Opening Attempt",
              }}
              streamType="on-demand"
              autoPlay={false}
              style={{ width: "100%", aspectRatio: "16/9" }}
            />
          </div>

          <form action={createAttempt} className="flex flex-col gap-4">
            {/* HIDDEN INPUT: Pass the playback ID to the server action */}
            <input type="hidden" name="videoUrl" value={playbackId} />

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
                {tools.map((tool) => (
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
                {brands.map((brand) => (
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
