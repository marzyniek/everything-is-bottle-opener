"use client";

import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";
import { useState } from "react";
import { createAttempt } from "../actions";

export default function UploadPage() {
  const [videoUrl, setVideoUrl] = useState<string>("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-8">Upload Your Attempt 🍾</h1>

      {/* PHASE 1: The Video Upload */}
      {!videoUrl ? (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 bg-gray-900/50">
          <UploadDropzone<OurFileRouter, "videoUploader">
            endpoint="videoUploader"
            onClientUploadComplete={(res) => {
              // Capture the URL given by UploadThing
              setVideoUrl(res[0].url);
              alert("Video uploaded! Now add details.");
            }}
            onUploadError={(error: Error) => {
              alert(`Error: ${error.message}`);
            }}
          />
        </div>
      ) : (
        /* PHASE 2: The Details Form */
        <div className="w-full max-w-md bg-gray-900 p-6 rounded-xl border border-gray-800">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg mb-6 bg-black"
          />

          <form action={createAttempt} className="flex flex-col gap-4">
            {/* HIDDEN INPUT: Pass the URL to the server action */}
            <input type="hidden" name="videoUrl" value={videoUrl} />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">
                Tool Used
              </label>
              <input
                name="toolUsed"
                placeholder="e.g. Lighter, Spoon"
                required
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">
                Beverage Brand
              </label>
              <input
                name="beverageBrand"
                placeholder="e.g. Corona, Coke"
                required
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg"
            >
              🚀 Publish
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
