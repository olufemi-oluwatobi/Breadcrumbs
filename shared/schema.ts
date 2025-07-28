import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const videoProjects = pgTable("video_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, processing, completed, error
  currentStep: integer("current_step").notNull().default(1),
  scriptContent: text("script_content"),
  audioFiles: jsonb("audio_files").$type<string[]>().default([]),
  mediaFiles: jsonb("media_files").$type<string[]>().default([]),
  extractedFrames: jsonb("extracted_frames").$type<string[]>().default([]),
  frameCount: integer("frame_count").default(0),
  extractionTime: real("extraction_time").default(0),
  // AI Analysis Results
  scriptAnalysis: jsonb("script_analysis").$type<{
    scriptSummary: string;
    mainThemes: string[];
    suggestedTiming: number;
    mood: string;
    visualElements: string[];
  }>(),
  mediaAnalyses: jsonb("media_analyses").$type<Array<{
    type: 'image' | 'video' | 'audio';
    description: string;
    suggestedUsage: string;
    duration?: number;
    keyFrames?: string[];
  }>>().default([]),
  assemblyPlan: jsonb("assembly_plan").$type<{
    totalDuration: number;
    scenes: Array<{
      sceneNumber: number;
      duration: number;
      description: string;
      mediaFiles: string[];
      audioOverlay?: string;
      textOverlay?: string;
      transitions: string;
    }>;
    audioTrack: string;
    pacing: 'slow' | 'medium' | 'fast';
    style: string;
  }>(),
  storyboardDescription: text("storyboard_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  type: text("type").notNull(), // system, user, progress, success, error
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVideoProjectSchema = createInsertSchema(videoProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VideoProject = typeof videoProjects.$inferSelect;
export type InsertVideoProject = z.infer<typeof insertVideoProjectSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
