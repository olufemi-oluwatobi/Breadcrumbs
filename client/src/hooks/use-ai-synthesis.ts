import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export interface AssemblyPlan {
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
}

export function useAnalyzeScript() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, scriptContent }: { projectId: string; scriptContent: string }) => {
      const response = await apiRequest('POST', '/api/analyze-script', { projectId, scriptContent });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useAnalyzeMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, mediaFiles }: { projectId: string; mediaFiles: string[] }) => {
      const response = await apiRequest('POST', '/api/analyze-media', { projectId, mediaFiles });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useCreateAssemblyPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      const response = await apiRequest('POST', '/api/create-assembly-plan', { projectId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}