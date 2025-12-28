# Mux Video Upload Migration

This project has been migrated from UploadThing to Mux for video uploads and streaming.

## Required Environment Variables

To use Mux for video uploads, you need to add the following environment variables to your `.env` file:

```bash
# Mux API Credentials
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

## How to Get Mux Credentials

1. Sign up for a Mux account at https://mux.com
2. Navigate to Settings > API Access Tokens
3. Create a new API token with the following permissions:
   - **Mux Video**: Read and Write
4. Copy the Token ID and Token Secret
5. Add them to your `.env` file

## How It Works

1. **Upload Flow:**
   - User visits `/upload` page
   - A direct upload URL is created via Mux API
   - User uploads video directly to Mux using the MuxUploader component
   - Once uploaded, the system polls for the video to be ready
   - When ready, the Mux Playback ID is stored in the database

2. **Playback:**
   - Videos are played using Mux's streaming URLs in the format:
     `https://stream.mux.com/{playbackId}.m3u8`
   - This provides adaptive bitrate streaming for optimal viewing experience

## Database Schema

The `videoUrl` field in the `attempts` table now stores the Mux Playback ID instead of a direct video URL.

## Migration Notes

- All old UploadThing dependencies have been removed
- The video upload component has been replaced with MuxUploader
- All video display components now use Mux streaming URLs
- The middleware has been updated to handle Mux API routes

## Testing

To test the video upload:

1. Ensure your Mux credentials are set in `.env`
2. Run the development server: `npm run dev`
3. Navigate to `/upload`
4. Sign in with your account
5. Upload a video using the Mux uploader
6. Wait for processing to complete
7. Verify the video appears in the feed

## Troubleshooting

- **Upload fails:** Check that your Mux credentials are correct
- **Video doesn't play:** Ensure the playback ID is stored correctly in the database
- **Processing takes too long:** Mux typically processes videos within a few seconds, but larger files may take longer
