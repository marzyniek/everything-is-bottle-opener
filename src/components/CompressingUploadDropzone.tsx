"use client";

import { useState } from "react";
import { compressVideo, shouldCompressVideo } from "@/lib/videoCompression";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface CompressingUploadDropzoneProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
  translations: {
    dropzone: string;
    compressing: string;
    uploading: string;
    error: string;
  };
}

export function CompressingUploadDropzone({
  onUploadComplete,
  onUploadError,
  translations,
}: CompressingUploadDropzoneProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      let fileToUpload = file;

      // Check if compression is needed
      if (shouldCompressVideo(file, 10)) {
        setIsCompressing(true);
        setCompressionProgress(0);

        fileToUpload = await compressVideo(file, (progress) => {
          setCompressionProgress(progress);
        });

        setIsCompressing(false);
      }

      setCompressedFile(fileToUpload);
      setShowUploader(true);
    } catch (error) {
      setIsCompressing(false);
      onUploadError(error as Error);
    }
  };

  if (isCompressing) {
    return (
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 bg-gray-900/50">
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold">{translations.compressing}</p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${compressionProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400">{compressionProgress}%</p>
        </div>
      </div>
    );
  }

  if (showUploader && compressedFile) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-solid border-green-700 rounded-xl p-4 bg-green-900/20 text-center">
          <p className="text-sm font-semibold text-green-400">
            ✓ Video compressed successfully
          </p>
        </div>
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 sm:p-10 bg-gray-900/50">
          <UploadDropzone<OurFileRouter, "videoUploader">
            endpoint="videoUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                onUploadComplete(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              setShowUploader(false);
              setCompressedFile(null);
              onUploadError(error);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 bg-gray-900/50">
      <div className="space-y-4 text-center">
        <label htmlFor="video-upload" className="cursor-pointer block">
          <div className="space-y-2">
            <p className="text-lg">{translations.dropzone}</p>
            <p className="text-sm text-gray-400">
              MP4, MOV, AVI, MKV, WEBM (max 64MB)
            </p>
            <p className="text-xs text-gray-500">
              Videos over 10MB will be automatically compressed
            </p>
          </div>
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
