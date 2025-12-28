import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json(
        { error: "Upload ID is required" },
        { status: 400 }
      );
    }

    // Get the upload details
    const upload = await mux.video.uploads.retrieve(uploadId);

    if (!upload.asset_id) {
      return NextResponse.json({
        status: "waiting",
        message: "Asset is still being created",
      });
    }

    // Get the asset details
    const asset = await mux.video.assets.retrieve(upload.asset_id);

    if (asset.status !== "ready") {
      return NextResponse.json({
        status: "processing",
        message: "Asset is being processed",
      });
    }

    // Get the playback ID
    const playbackId = asset.playback_ids?.[0]?.id;

    if (!playbackId) {
      return NextResponse.json(
        { error: "No playback ID available" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ready",
      playbackId: playbackId,
      assetId: asset.id,
    });
  } catch (error) {
    console.error("Error retrieving Mux asset:", error);
    return NextResponse.json(
      { error: "Failed to retrieve asset" },
      { status: 500 }
    );
  }
}
