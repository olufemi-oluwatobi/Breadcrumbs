import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeScript, analyzeMedia, createAssemblyPlan, generateStoryboardDescription } from "./ai/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Analysis Routes
  app.post("/api/analyze-script", async (req, res) => {
    try {
      const { projectId, scriptContent } = req.body;
      
      if (!projectId || !scriptContent) {
        return res.status(400).json({ error: "Missing projectId or scriptContent" });
      }

      const analysis = await analyzeScript(scriptContent);
      
      // Update project with script analysis
      const currentProject = await storage.getVideoProject(projectId);
      await storage.updateVideoProject(projectId, {
        scriptAnalysis: analysis,
        currentStep: Math.max(2, currentProject?.currentStep || 1)
      });

      res.json({ success: true, analysis });
    } catch (error) {
      console.error("Script analysis failed:", error);
      res.status(500).json({ error: "Failed to analyze script" });
    }
  });

  app.post("/api/analyze-media", async (req, res) => {
    try {
      const { projectId, mediaFiles } = req.body;
      
      if (!projectId || !mediaFiles?.length) {
        return res.status(400).json({ error: "Missing projectId or mediaFiles" });
      }

      const analyses = [];
      for (const file of mediaFiles) {
        try {
          // Determine media type from file extension
          const extension = file.toLowerCase().split('.').pop();
          let mediaType: 'image' | 'video' | 'audio' = 'image';
          
          if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
            mediaType = 'video';
          } else if (['mp3', 'wav', 'm4a', 'aac'].includes(extension)) {
            mediaType = 'audio';
          }
          
          const analysis = await analyzeMedia(file, mediaType);
          analyses.push(analysis);
        } catch (error) {
          console.error(`Failed to analyze ${file}:`, error);
          // Continue with other files
        }
      }

      // Update project with media analyses
      const currentProject = await storage.getVideoProject(projectId);
      await storage.updateVideoProject(projectId, {
        mediaAnalyses: analyses,
        currentStep: Math.max(3, currentProject?.currentStep || 1)
      });

      res.json({ success: true, analyses });
    } catch (error) {
      console.error("Media analysis failed:", error);
      res.status(500).json({ error: "Failed to analyze media" });
    }
  });

  app.post("/api/create-assembly-plan", async (req, res) => {
    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: "Missing projectId" });
      }

      const project = await storage.getVideoProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.scriptAnalysis || !project.mediaAnalyses || project.mediaAnalyses.length === 0) {
        return res.status(400).json({ 
          error: "Script and media analysis required",
          details: {
            hasScript: !!project.scriptAnalysis,
            hasMediaAnalysis: !!project.mediaAnalyses,
            mediaCount: project.mediaAnalyses?.length || 0
          }
        });
      }

      const assemblyPlan = await createAssemblyPlan(project.scriptAnalysis, project.mediaAnalyses);
      const storyboardDescription = await generateStoryboardDescription(assemblyPlan);
      
      // Update project with assembly plan
      await storage.updateVideoProject(projectId, {
        assemblyPlan,
        storyboardDescription,
        currentStep: Math.max(4, project.currentStep || 1)
      });

      res.json({ success: true, assemblyPlan, storyboardDescription });
    } catch (error) {
      console.error("Assembly plan creation failed:", error);
      res.status(500).json({ error: "Failed to create assembly plan" });
    }
  });

  app.get("/api/projects/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getVideoProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Failed to get project:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const { title, description } = req.body;
      
      const project = await storage.createVideoProject({
        userId: "default", // TODO: implement proper auth
        title: title || "New Video Project",
        description: description || "",
        status: "draft",
        currentStep: 1
      });
      
      res.json(project);
    } catch (error) {
      console.error("Failed to create project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
