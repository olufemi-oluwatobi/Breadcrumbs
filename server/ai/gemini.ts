import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ContentAnalysis {
  scriptSummary: string;
  mainThemes: string[];
  suggestedTiming: number;
  mood: string;
  visualElements: string[];
}

export interface MediaAnalysis {
  type: 'image' | 'video' | 'audio';
  description: string;
  suggestedUsage: string;
  duration?: number;
  keyFrames?: string[];
}

export interface StoryboardScene {
  sceneNumber: number;
  duration: number;
  description: string;
  mediaFiles: string[];
  audioOverlay?: string;
  textOverlay?: string;
  transitions: string;
}

export interface AssemblyPlan {
  totalDuration: number;
  scenes: StoryboardScene[];
  audioTrack: string;
  pacing: 'slow' | 'medium' | 'fast';
  style: string;
}

export async function analyzeScript(scriptContent: string): Promise<ContentAnalysis> {
  try {
    const systemPrompt = `You are a video content analysis expert. Analyze the provided script and extract key information for video production.
    
    Respond with JSON in this exact format:
    {
      "scriptSummary": "brief summary of the script content",
      "mainThemes": ["theme1", "theme2", "theme3"],
      "suggestedTiming": number_in_seconds,
      "mood": "energetic|calm|professional|dramatic|educational",
      "visualElements": ["element1", "element2", "element3"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            scriptSummary: { type: "string" },
            mainThemes: { type: "array", items: { type: "string" } },
            suggestedTiming: { type: "number" },
            mood: { type: "string" },
            visualElements: { type: "array", items: { type: "string" } }
          },
          required: ["scriptSummary", "mainThemes", "suggestedTiming", "mood", "visualElements"]
        }
      },
      contents: `Script to analyze: ${scriptContent}`
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson) as ContentAnalysis;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to analyze script: ${error}`);
  }
}

export async function analyzeMedia(mediaPath: string, mediaType: 'image' | 'video' | 'audio'): Promise<MediaAnalysis> {
  try {
    let contents: any[] = [];
    let prompt = "";

    if (mediaType === 'image') {
      const imageBytes = fs.readFileSync(mediaPath);
      contents = [
        {
          inlineData: {
            data: imageBytes.toString("base64"),
            mimeType: "image/jpeg",
          },
        }
      ];
      prompt = `Analyze this image for video production use. Describe what you see and suggest how it could be used in a video.`;
    } else if (mediaType === 'video') {
      const videoBytes = fs.readFileSync(mediaPath);
      contents = [
        {
          inlineData: {
            data: videoBytes.toString("base64"),
            mimeType: "video/mp4",
          },
        }
      ];
      prompt = `Analyze this video clip. Describe the content, estimate duration, and suggest how it could be used in video production.`;
    } else {
      // For audio, we'll analyze based on filename and duration
      prompt = `Analyze this audio file: ${mediaPath}. Suggest how it could be used in video production.`;
    }

    const systemPrompt = `You are a media analysis expert. Analyze the provided media and respond with JSON in this exact format:
    {
      "type": "${mediaType}",
      "description": "detailed description of the media content",
      "suggestedUsage": "how this could be used in video production",
      "duration": estimated_duration_in_seconds_or_null,
      "keyFrames": ["description1", "description2"] or null,
      "transitions": "suggested transition effects"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
      contents: [...contents, prompt]
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson) as MediaAnalysis;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error(`Failed to analyze ${mediaType}:`, error);
    // Return a fallback analysis
    return {
      type: mediaType,
      description: `${mediaType} file for video production`,
      suggestedUsage: `Can be used as ${mediaType} content in the video`,
      duration: mediaType === 'audio' ? 30 : undefined
    };
  }
}

export async function createAssemblyPlan(
  scriptAnalysis: ContentAnalysis,
  mediaAnalyses: MediaAnalysis[]
): Promise<AssemblyPlan> {
  try {
    const systemPrompt = `You are a video assembly expert. Create a detailed production plan for combining script content with available media.
    
    Respond with JSON in this exact format:
    {
      "totalDuration": number_in_seconds,
      "scenes": [
        {
          "sceneNumber": 1,
          "duration": number_in_seconds,
          "description": "what happens in this scene",
          "mediaFiles": ["filename1", "filename2"],
          "audioOverlay": "audio_filename or null",
          "textOverlay": "text to display or null",
          "transitions": "transition effect description"
        }
      ],
      "audioTrack": "main_audio_filename",
      "pacing": "slow|medium|fast",
      "style": "description of overall video style"
    }`;

    const promptContent = `
    Script Analysis: ${JSON.stringify(scriptAnalysis)}
    
    Available Media: ${JSON.stringify(mediaAnalyses)}
    
    Create a comprehensive assembly plan that combines these elements into a cohesive video.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            totalDuration: { type: "number" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sceneNumber: { type: "number" },
                  duration: { type: "number" },
                  description: { type: "string" },
                  mediaFiles: { type: "array", items: { type: "string" } },
                  audioOverlay: { type: "string" },
                  textOverlay: { type: "string" },
                  transitions: { type: "string" }
                }
              }
            },
            audioTrack: { type: "string" },
            pacing: { type: "string" },
            style: { type: "string" }
          },
          required: ["totalDuration", "scenes", "audioTrack", "pacing", "style"]
        }
      },
      contents: promptContent
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson) as AssemblyPlan;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to create assembly plan: ${error}`);
  }
}

export async function generateStoryboardDescription(assemblyPlan: AssemblyPlan): Promise<string> {
  try {
    const prompt = `Based on this video assembly plan, create a detailed storyboard description that explains the visual flow and timing:

${JSON.stringify(assemblyPlan, null, 2)}

Provide a narrative description of how the video will look and flow from scene to scene.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || "Storyboard description not available";
  } catch (error) {
    throw new Error(`Failed to generate storyboard description: ${error}`);
  }
}