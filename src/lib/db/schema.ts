import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const mixStatusEnum = pgEnum("mix_status", [
  "pending",
  "generating",
  "selecting",
  "synthesizing",
  "completed",
  "failed",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "generating",
  "completed",
  "failed",
]);

export const synthesisStatusEnum = pgEnum("synthesis_status", [
  "pending",
  "synthesizing",
  "completed",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  creditsRemaining: integer("credits_remaining").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mixes = pgTable("mixes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  prompt: text("prompt").notNull(),
  status: mixStatusEnum("status").notNull().default("pending"),
  triggerRunId: text("trigger_run_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  mixId: uuid("mix_id")
    .notNull()
    .references(() => mixes.id),
  modelName: text("model_name").notNull(),
  modelProvider: text("model_provider").notNull(),
  styleVariant: text("style_variant").notNull(),
  imageUrl: text("image_url"),
  status: generationStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  generationTimeMs: integer("generation_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const selections = pgTable("selections", {
  id: uuid("id").defaultRandom().primaryKey(),
  mixId: uuid("mix_id")
    .notNull()
    .references(() => mixes.id),
  category: text("category").notNull(),
  generationId: uuid("generation_id")
    .notNull()
    .references(() => generations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const synthesisResults = pgTable("synthesis_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  mixId: uuid("mix_id")
    .notNull()
    .references(() => mixes.id),
  imageUrl: text("image_url"),
  synthesisPrompt: text("synthesis_prompt").notNull(),
  synthesisModel: text("synthesis_model").notNull(),
  status: synthesisStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inferred types for use throughout the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Mix = typeof mixes.$inferSelect;
export type NewMix = typeof mixes.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type Selection = typeof selections.$inferSelect;
export type NewSelection = typeof selections.$inferInsert;
export type SynthesisResult = typeof synthesisResults.$inferSelect;
export type NewSynthesisResult = typeof synthesisResults.$inferInsert;
