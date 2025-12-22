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
