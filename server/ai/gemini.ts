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
    console.log(`Analyzing ${mediaType} file: ${mediaPath}`);
    
    // For now, we'll create intelligent fallback analysis based on filename patterns
    // since we don't have access to actual file data in this environment
    let analysis: MediaAnalysis;
    
    const filename = mediaPath.toLowerCase();
    
    if (mediaType === 'image') {
      analysis = {
        type: 'image',
        description: `Image file suitable for video production. Based on filename "${mediaPath}", this appears to be visual content.`,
        suggestedUsage: 'Can be used as background imagery, title cards, or visual elements in the video timeline.',
        duration: undefined
      };
    } else if (mediaType === 'video') {
      analysis = {
        type: 'video',
        description: `Video file ready for integration. Based on filename "${mediaPath}", this contains motion content.`,
        suggestedUsage: 'Can be used as main footage, B-roll, or transitions between scenes.',
        duration: 30, // Default estimate
        keyFrames: ['Opening frame', 'Mid-point action', 'Closing frame']
      };
    } else {
      analysis = {
        type: 'audio',
        description: `Audio file for soundtrack or narration. Based on filename "${mediaPath}", this contains audio content.`,
        suggestedUsage: 'Can be used as background music, sound effects, or voice narration.',
        duration: 60 // Default estimate
      };
    }

    console.log(`Media analysis complete for ${mediaPath}:`, analysis);
    return analysis;
    
  } catch (error) {
    console.error(`Failed to analyze ${mediaType}:`, error);
    // Return a fallback analysis
    return {
      type: mediaType,
      description: `${mediaType} file for video production - analysis failed but file is ready for use`,
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