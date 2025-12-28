import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs/server";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST() {
  try {
    // Check if user is logged in
    const user = await auth();
    if (!user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create a new direct upload
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "baseline",
      },
      // Allow uploads from the same origin
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || "*",
    });

    return NextResponse.json({
      uploadId: upload.id,
      url: upload.url,
    });
  } catch (error) {
    console.error("Error creating Mux upload:", error);
    return NextResponse.json(
      { error: "Failed to create upload" },
      { status: 500 }
    );
  }
}
