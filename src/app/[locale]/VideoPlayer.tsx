"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
  preload?: "none" | "metadata" | "auto";
  className?: string;
}

export default function VideoPlayer({ playbackId, preload = "metadata", className }: VideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      preload={preload}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
}
