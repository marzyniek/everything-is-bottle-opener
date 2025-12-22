# Database Migration: Comments and Votes

This migration adds support for comments and voting on bottle opener attempts.

## What's New

### Database Changes
- **Comments Table**: Allows users to comment on attempts
- **Votes Table**: Allows users to upvote or downvote attempts

### New Features
1. **All Attempts Page** (`/attempts`): View all attempts with statistics
   - Total number of bottles opened
   - Number of different tools used
   - Browse attempts by tool

2. **Tool-Specific Pages** (`/attempts/tool/[toolName]`): View all attempts for a specific tool

3. **Voting System**: Upvote/downvote buttons on each attempt
   - Users can upvote (+1) or downvote (-1)
   - Clicking the same vote again removes it (toggle)
   - Vote count is displayed with color coding (green for positive, red for negative)

4. **Comments**: Add comments to any attempt
   - Click "Add Comment" to reveal the comment form
   - Comments are stored in the database

## How to Apply This Migration

### Option 1: Using Drizzle Kit (Recommended)
```bash
# Run the migration
npx drizzle-kit push
```

### Option 2: Manual SQL Execution
Execute the SQL file directly on your database:
```bash
psql $DATABASE_URL -f drizzle/0002_add_comments_and_votes.sql
```

### Option 3: Copy and paste the SQL
Connect to your PostgreSQL database and run the following SQL:

```sql
-- Add comments table
CREATE TABLE IF NOT EXISTS "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"attempt_id" uuid NOT NULL
);

-- Add votes table
CREATE TABLE IF NOT EXISTS "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"attempt_id" uuid NOT NULL
);

-- Add foreign keys
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "votes" ADD CONSTRAINT "votes_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE cascade ON UPDATE no action;
```

## Testing the Features

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Test the new features:
   - Click "View All Attempts" to see the statistics page
   - Click on a tool name to see all attempts for that tool
   - Click the upvote/downvote buttons (must be signed in)
   - Click "Add Comment" to add a comment to an attempt (must be signed in)

## Technical Details

### New Server Actions
- `addComment(attemptId, content)`: Creates a new comment
- `addVote(attemptId, value)`: Creates, updates, or removes a vote

### New Components
- `VoteButtons`: Client component for voting UI
- `CommentSection`: Client component for commenting UI

### Database Schema
```typescript
// Comments
{
  id: uuid (PK)
  content: text
  created_at: timestamp
  user_id: text (FK -> users.id)
  attempt_id: uuid (FK -> attempts.id)
}

// Votes
{
  id: uuid (PK)
  value: integer (-1 or 1)
  created_at: timestamp
  user_id: text (FK -> users.id)
  attempt_id: uuid (FK -> attempts.id)
}
```

### Navigation Updates
- Home page now has a "View All Attempts" button
- All attempts page shows statistics and tools list
- Each tool card links to its dedicated page
