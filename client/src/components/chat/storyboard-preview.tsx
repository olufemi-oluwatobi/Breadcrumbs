import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Image, Music, FileText, ArrowRight } from "lucide-react";

interface StoryboardScene {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: 'intro' | 'content' | 'transition' | 'outro';
  elements: {
    visual: string;
    audio: string;
    text: string;
  };
}

interface StoryboardPreviewProps {
  className?: string;
}

export function StoryboardPreview({ className }: StoryboardPreviewProps) {
  const scenes: StoryboardScene[] = [
    {
      id: 1,
      title: "Opening Scene",
      description: "Hook the audience with compelling visuals",
      duration: "0:00 - 0:15",
      type: 'intro',
      elements: {
        visual: "Dynamic title animation with background video",
        audio: "Upbeat intro music with voiceover",
        text: "Welcome to our story..."
      }
    },
    {
      id: 2,
      title: "Main Content",
      description: "Core message delivery with supporting visuals",
      duration: "0:15 - 1:30",
      type: 'content',
      elements: {
        visual: "Split-screen with speaker and graphics",
        audio: "Clear narration with background music",
        text: "Key points and statistics overlay"
      }
    },
    {
      id: 3,
      title: "Visual Transition",
      description: "Smooth transition to next segment",
      duration: "1:30 - 1:35",
      type: 'transition',
      elements: {
        visual: "Animated graphics connecting themes",
        audio: "Musical bridge with sound effects",
        text: "Transitional text animation"
      }
    },
    {
      id: 4,
      title: "Call to Action",
      description: "Engaging conclusion with clear next steps",
      duration: "1:35 - 2:00",
      type: 'outro',
      elements: {
        visual: "Contact information and brand elements",
        audio: "Motivational music with final message",
        text: "Subscribe, Like, and Follow"
      }
    }
  ];

  const getSceneColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'content': return 'bg-green-100 border-green-300 text-green-800';
      case 'transition': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'outro': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'intro': return <Play className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'transition': return <ArrowRight className="w-4 h-4" />;
      case 'outro': return <Image className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
          <Image className="text-white w-4 h-4" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">AI-Generated Storyboard</h3>
        <Badge className="ml-auto bg-blue-600 text-white">4 Scenes</Badge>
      </div>

      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <div key={scene.id} className="relative">
            <Card className={`p-4 ${getSceneColor(scene.type)} border-2`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getSceneIcon(scene.type)}
                  <div className="ml-2">
                    <h4 className="font-medium">{scene.title}</h4>
                    <p className="text-sm opacity-75">{scene.duration}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Scene {scene.id}
                </Badge>
              </div>
              
              <p className="text-sm mb-3 opacity-90">{scene.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/50 p-2 rounded">
                  <div className="flex items-center mb-1">
                    <Image className="w-3 h-3 mr-1" />
                    <span className="font-medium">Visual</span>
                  </div>
                  <p className="opacity-75">{scene.elements.visual}</p>
                </div>
                <div className="bg-white/50 p-2 rounded">
                  <div className="flex items-center mb-1">
                    <Music className="w-3 h-3 mr-1" />
                    <span className="font-medium">Audio</span>
                  </div>
                  <p className="opacity-75">{scene.elements.audio}</p>
                </div>
                <div className="bg-white/50 p-2 rounded">
                  <div className="flex items-center mb-1">
                    <FileText className="w-3 h-3 mr-1" />
                    <span className="font-medium">Text</span>
                  </div>
                  <p className="opacity-75">{scene.elements.text}</p>
                </div>
              </div>
            </Card>
            
            {index < scenes.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowRight className="text-gray-400 w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-white/50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-medium">AI Insight:</span> This storyboard creates a compelling narrative flow 
          that maintains viewer engagement through strategic pacing and visual variety.
        </p>
      </div>
    </Card>
  );
}