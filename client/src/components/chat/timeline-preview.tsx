import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Volume2, Image, Type, Play } from "lucide-react";

interface TimelineSegment {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  color: string;
  type: 'video' | 'audio' | 'text' | 'transition';
  content: string;
}

interface TimelinePreviewProps {
  className?: string;
}

export function TimelinePreview({ className }: TimelinePreviewProps) {
  const totalDuration = 120; // 2 minutes in seconds
  
  const segments: TimelineSegment[] = [
    {
      id: 1,
      title: "Opening Hook",
      startTime: 0,
      endTime: 15,
      color: "bg-blue-500",
      type: 'video',
      content: "Dynamic intro with logo animation"
    },
    {
      id: 2,
      title: "Background Music",
      startTime: 0,
      endTime: 120,
      color: "bg-green-500",
      type: 'audio',
      content: "Upbeat instrumental track"
    },
    {
      id: 3,
      title: "Main Content",
      startTime: 15,
      endTime: 90,
      color: "bg-purple-500",
      type: 'video',
      content: "Core presentation with visuals"
    },
    {
      id: 4,
      title: "Title Cards",
      startTime: 10,
      endTime: 110,
      color: "bg-orange-500",
      type: 'text',
      content: "Animated titles and captions"
    },
    {
      id: 5,
      title: "Smooth Transition",
      startTime: 90,
      endTime: 95,
      color: "bg-pink-500",
      type: 'transition',
      content: "Cross-fade to final scene"
    },
    {
      id: 6,
      title: "Call to Action",
      startTime: 95,
      endTime: 120,
      color: "bg-indigo-500",
      type: 'video',
      content: "Subscribe prompt with animations"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-3 h-3" />;
      case 'audio': return <Volume2 className="w-3 h-3" />;
      case 'text': return <Type className="w-3 h-3" />;
      case 'transition': return <Image className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSegmentWidth = (segment: TimelineSegment) => {
    return ((segment.endTime - segment.startTime) / totalDuration) * 100;
  };

  const getSegmentLeft = (segment: TimelineSegment) => {
    return (segment.startTime / totalDuration) * 100;
  };

  // Group segments by type for layered display
  const videoSegments = segments.filter(s => s.type === 'video');
  const audioSegments = segments.filter(s => s.type === 'audio');
  const textSegments = segments.filter(s => s.type === 'text');
  const transitionSegments = segments.filter(s => s.type === 'transition');

  return (
    <Card className={`p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
          <Clock className="text-white w-4 h-4" />
        </div>
        <h3 className="text-lg font-semibold text-purple-900">Smart Timeline</h3>
        <Badge className="ml-auto bg-purple-600 text-white">
          {formatTime(totalDuration)}
        </Badge>
      </div>

      {/* Timeline Tracks */}
      <div className="space-y-4">
        {/* Video Track */}
        <div className="bg-white/50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center mb-2">
            <Play className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Video Track</span>
          </div>
          <div className="relative h-8 bg-gray-200 rounded">
            {videoSegments.concat(transitionSegments).map((segment) => (
              <div
                key={segment.id}
                className={`absolute h-full rounded ${segment.color} opacity-80 flex items-center justify-center`}
                style={{
                  left: `${getSegmentLeft(segment)}%`,
                  width: `${getSegmentWidth(segment)}%`
                }}
                title={segment.content}
              >
                <span className="text-white text-xs font-medium truncate px-1">
                  {segment.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Track */}
        <div className="bg-white/50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center mb-2">
            <Volume2 className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Audio Track</span>
          </div>
          <div className="relative h-8 bg-gray-200 rounded">
            {audioSegments.map((segment) => (
              <div
                key={segment.id}
                className={`absolute h-full rounded ${segment.color} opacity-80 flex items-center justify-center`}
                style={{
                  left: `${getSegmentLeft(segment)}%`,
                  width: `${getSegmentWidth(segment)}%`
                }}
                title={segment.content}
              >
                <span className="text-white text-xs font-medium truncate px-1">
                  {segment.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Text Track */}
        <div className="bg-white/50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center mb-2">
            <Type className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Text & Graphics</span>
          </div>
          <div className="relative h-8 bg-gray-200 rounded">
            {textSegments.map((segment) => (
              <div
                key={segment.id}
                className={`absolute h-full rounded ${segment.color} opacity-80 flex items-center justify-center`}
                style={{
                  left: `${getSegmentLeft(segment)}%`,
                  width: `${getSegmentWidth(segment)}%`
                }}
                title={segment.content}
              >
                <span className="text-white text-xs font-medium truncate px-1">
                  {segment.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="mt-4 relative">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0:00</span>
          <span>0:30</span>
          <span>1:00</span>
          <span>1:30</span>
          <span>2:00</span>
        </div>
        <div className="h-1 bg-gray-300 rounded relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 rounded"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gray-400"></div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-gray-400"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gray-400"></div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-700">6</div>
          <div className="text-xs text-gray-600">Segments</div>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-blue-700">3</div>
          <div className="text-xs text-gray-600">Video Clips</div>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-green-700">1</div>
          <div className="text-xs text-gray-600">Audio Track</div>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-orange-700">1</div>
          <div className="text-xs text-gray-600">Text Layer</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-700">
          <span className="font-medium">Smart Timing:</span> AI has optimized pacing to maintain 
          viewer engagement with strategic content breaks and smooth transitions.
        </p>
      </div>
    </Card>
  );
}