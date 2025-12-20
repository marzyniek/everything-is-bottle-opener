import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Define a route called "videoUploader"
  videoUploader: f({ video: { maxFileSize: "64MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // 1. Check if user is logged in
      const user = auth();
      if (!(await user).userId) throw new Error("Unauthorized");

      // 2. Return their ID so we can tag the file (optional)
      return { userId: (await user).userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This runs on your server after the upload finishes
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
