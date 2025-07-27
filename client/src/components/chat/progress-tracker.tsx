import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Film } from "lucide-react";

interface ProgressTrackerProps {
  currentFrame: number;
  totalFrames: number;
  extractionTime: number;
  fps: number;
  filename: string;
  className?: string;
}

export function ProgressTracker({
  currentFrame,
  totalFrames,
  extractionTime,
  fps,
  filename,
  className
}: ProgressTrackerProps) {
  const progress = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

  return (
    <Card className={`p-4 bg-orange-50 border-orange-200 ${className}`}>
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse mr-3">
          <Film className="text-white" size={16} />
        </div>
        <p className="text-orange-800 font-medium">🎬 Extracting frames from your video...</p>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm text-orange-700 mb-1">
          <span>Processing: {filename}</span>
          <span>{currentFrame}/{totalFrames} frames</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-orange-700">
          <div className="font-medium">{extractionTime.toFixed(1)}s</div>
          <div className="text-xs">Extraction Time</div>
        </div>
        <div className="text-orange-700">
          <div className="font-medium">{fps} FPS</div>
          <div className="text-xs">Frame Rate</div>
        </div>
      </div>
    </Card>
  );
}
