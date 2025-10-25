import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../auth-schema";

export const conversations = pgTable("conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    title: text("title"),
    model: text("model"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const roleEnum = pgEnum("role_enum", [
    "user",
    "assistant",
    "system",
])

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").references(() => conversations.id, {onDelete: "cascade"}).notNull(),
    role: roleEnum("role").notNull(),      // 'user', 'assistant', 'system'
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// export const attachments = pgTable("attachments", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   messageId: uuid("message_id").notNull(),
//   type: text("type").notNull(),  // 'audio', 'image', 'file'
//   url: text("url").notNull(),
//   size: text("size"),            // optional
//   mimeType: text("mime_type"),
//   createdAt: timestamp("created_at").defaultNow(),
// });