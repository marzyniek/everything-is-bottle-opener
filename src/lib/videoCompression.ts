import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

/**
 * Initialize FFmpeg instance with WebAssembly files
 * This loads the FFmpeg WASM files from CDN
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  
  // Load FFmpeg from CDN
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

/**
 * Compress a video file using FFmpeg
 * @param file - The input video file
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Compressed video as a Blob
 */
export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    const ffmpeg = await loadFFmpeg();

    // Set up progress handler
    if (onProgress) {
      ffmpeg.on("progress", ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    // Write input file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile("input.mp4", await fetchFile(file));

    // Compress video with H.264 codec and reduced bitrate
    // -c:v libx264: Use H.264 video codec
    // -crf 28: Constant Rate Factor (higher = more compression, 18-28 is good range)
    // -preset fast: Encoding speed preset
    // -c:a aac: Use AAC audio codec
    // -b:a 128k: Audio bitrate
    // -vf scale=1280:-2: Scale video to max 1280px width, maintain aspect ratio
    await ffmpeg.exec([
      "-i", "input.mp4",
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "fast",
      "-c:a", "aac",
      "-b:a", "128k",
      "-vf", "scale='min(1280,iw)':-2",
      "output.mp4"
    ]);

    // Read the compressed file
    const data = await ffmpeg.readFile("output.mp4");
    
    // Clean up
    await ffmpeg.deleteFile("input.mp4");
    await ffmpeg.deleteFile("output.mp4");

    // Convert Uint8Array to Blob and then to File
    const blob = new Blob([data as BlobPart], { type: "video/mp4" });
    const compressedFile = new File([blob], file.name, {
      type: "video/mp4",
      lastModified: Date.now(),
    });

    return compressedFile;
  } catch (error) {
    console.error("Error compressing video:", error);
    throw new Error("Failed to compress video. The video may be in an unsupported format.");
  }
}

/**
 * Check if a video file needs compression
 * @param file - The video file to check
 * @param maxSizeMB - Maximum size in MB before compression is needed
 * @returns true if file should be compressed
 */
export function shouldCompressVideo(file: File, maxSizeMB: number = 10): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > maxSizeMB;
}
