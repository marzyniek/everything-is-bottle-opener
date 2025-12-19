import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Changed from uuid to text to match Clerk ID
  email: text("email").notNull(),
  username: text("username"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attempts = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  toolUsed: text("tool_used").notNull(),
  beverageBrand: text("beverage_brand").notNull(),
  videoUrl: text("video_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  attempts: many(attempts),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id],
  }),
}));
