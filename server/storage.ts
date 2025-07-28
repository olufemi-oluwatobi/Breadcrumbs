import { type User, type InsertUser, type VideoProject, type InsertVideoProject } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video Project methods
  getVideoProject(id: string): Promise<VideoProject | undefined>;
  createVideoProject(project: InsertVideoProject): Promise<VideoProject>;
  updateVideoProject(id: string, updates: Partial<VideoProject>): Promise<VideoProject | undefined>;
  getUserVideoProjects(userId: string): Promise<VideoProject[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private videoProjects: Map<string, VideoProject>;

  constructor() {
    this.users = new Map();
    this.videoProjects = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getVideoProject(id: string): Promise<VideoProject | undefined> {
    return this.videoProjects.get(id);
  }

  async createVideoProject(insertProject: InsertVideoProject): Promise<VideoProject> {
    const id = randomUUID();
    const now = new Date();
    const project: VideoProject = { 
      ...insertProject,
      id,
      status: insertProject.status || "draft",
      currentStep: insertProject.currentStep || 1,
      scriptContent: insertProject.scriptContent || null,
      description: insertProject.description || null,
      audioFiles: (insertProject.audioFiles || []) as string[],
      mediaFiles: (insertProject.mediaFiles || []) as string[],
      extractedFrames: (insertProject.extractedFrames || []) as string[],
      frameCount: insertProject.frameCount || 0,
      extractionTime: insertProject.extractionTime || 0,
      scriptAnalysis: insertProject.scriptAnalysis as any || null,
      mediaAnalyses: insertProject.mediaAnalyses as any || [],
      assemblyPlan: insertProject.assemblyPlan as any || null,
      storyboardDescription: insertProject.storyboardDescription || null,
      createdAt: now,
      updatedAt: now
    };
    this.videoProjects.set(id, project);
    return project;
  }

  async updateVideoProject(id: string, updates: Partial<VideoProject>): Promise<VideoProject | undefined> {
    const existing = this.videoProjects.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated: VideoProject = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.videoProjects.set(id, updated);
    return updated;
  }

  async getUserVideoProjects(userId: string): Promise<VideoProject[]> {
    return Array.from(this.videoProjects.values()).filter(
      (project) => project.userId === userId,
    );
  }
}

export const storage = new MemStorage();
