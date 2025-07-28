import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import { StoryboardPreview } from "./storyboard-preview";
import { TimelinePreview } from "./timeline-preview";

export type MessageType = 'system' | 'user' | 'progress' | 'success' | 'error' | 'processing';

interface MessageBubbleProps {
  type: MessageType;
  content: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
  className?: string;
}

export function MessageBubble({ type, content, metadata, timestamp, className }: MessageBubbleProps) {
  const isSystem = type === 'system' || type === 'progress' || type === 'success' || type === 'error' || type === 'processing';
  
  const getIcon = () => {
    switch (type) {
      case 'system':
        return <Bot className="text-blue-600" size={16} />;
      case 'user':
        return <User className="text-gray-600" size={16} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={16} />;
      case 'processing':
        return <Loader2 className="text-orange-600 animate-spin" size={16} />;
      case 'progress':
        return <Loader2 className="text-orange-600 animate-spin" size={16} />;
      default:
        return <Bot className="text-blue-600" size={16} />;
    }
  };

  const getBubbleStyle = () => {
    if (!isSystem) {
      return "bg-blue-600 text-white rounded-2xl rounded-br-md ml-auto";
    }
    
    switch (type) {
      case 'success':
        return "bg-green-50 border border-green-200 rounded-2xl rounded-tl-md";
      case 'error':
        return "bg-red-50 border border-red-200 rounded-2xl rounded-tl-md";
      case 'processing':
      case 'progress':
        return "bg-orange-50 border border-orange-200 rounded-2xl rounded-tl-md";
      default:
        return "bg-gray-100 rounded-2xl rounded-tl-md";
    }
  };

  const getTextStyle = () => {
    if (!isSystem) return "text-white";
    
    switch (type) {
      case 'success':
        return "text-green-800";
      case 'error':
        return "text-red-800";
      case 'processing':
      case 'progress':
        return "text-orange-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className={`message-bubble flex ${isSystem ? 'items-start space-x-3' : 'justify-end'} ${className}`}>
      {isSystem && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          type === 'success' ? 'bg-green-500' :
          type === 'error' ? 'bg-red-500' :
          type === 'processing' || type === 'progress' ? 'bg-orange-500' :
          'bg-blue-600'
        }`}>
          <div className="text-white">
            {getIcon()}
          </div>
        </div>
      )}
      
      <div className={`p-4 max-w-md lg:max-w-lg ${getBubbleStyle()}`}>
        <p className={`${getTextStyle()} whitespace-pre-wrap`}>{content}</p>
        
        {metadata && (
          <div className="mt-3">
            {metadata.files && (
              <div className="space-y-2">
                {metadata.files.map((file: any, index: number) => (
                  <div key={index} className={`flex items-center text-sm ${getTextStyle()}`}>
                    <CheckCircle className="mr-2" size={14} />
                    {file.name} ({file.size})
                  </div>
                ))}
              </div>
            )}
            
            {(metadata.progress !== undefined || metadata.stage) && (
              <div className="mt-3">
                {metadata.stage && (
                  <div className={`text-sm font-medium mb-2 ${getTextStyle()}`}>
                    {metadata.stage}
                  </div>
                )}
                {metadata.progress !== undefined && (
                  <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${metadata.progress}%` }}
                    />
                  </div>
                )}
                {metadata.filename && metadata.currentFrame && metadata.totalFrames && (
                  <div className={`flex justify-between text-sm mb-1 ${getTextStyle()}`}>
                    <span>Processing: {metadata.filename}</span>
                    <span>{metadata.currentFrame}/{metadata.totalFrames} frames</span>
                  </div>
                )}
                {metadata.extractionTime && (
                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div className={getTextStyle()}>
                      <div className="font-medium">{metadata.extractionTime}s</div>
                      <div className="text-xs opacity-75">Extraction Time</div>
                    </div>
                    <div className={getTextStyle()}>
                      <div className="font-medium">{metadata.fps || 1} FPS</div>
                      <div className="text-xs opacity-75">Frame Rate</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {metadata.frames && (
              <div className="mt-3">
                <p className={`font-medium mb-3 ${getTextStyle()}`}>
                  ✨ Frame extraction complete! Here's a preview:
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {metadata.frames.slice(0, 3).map((frame: string, index: number) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={frame} 
                        alt={`Video frame ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-between text-sm ${getTextStyle()}`}>
                  <span>{metadata.frames.length} frames extracted</span>
                  <button className="text-blue-600 hover:underline">View All</button>
                </div>
              </div>
            )}

            {metadata.storyboard && (
              <div className="mt-4">
                <StoryboardPreview />
              </div>
            )}

            {metadata.timeline && (
              <div className="mt-4">
                <TimelinePreview />
              </div>
            )}

            {metadata.scriptText && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg border border-gray-200">
                <div className={`flex items-center mb-2 ${getTextStyle()}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="font-medium">Script Content</span>
                </div>
                <div className={`text-sm ${getTextStyle()} bg-white p-3 rounded border italic`}>
                  "{metadata.scriptText}"
                </div>
              </div>
            )}

            {metadata.confirmation && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-800 font-medium">Files ready: {metadata.fileCount}</span>
                  <div className="flex space-x-2 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Type 'yes'</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Type 'no'</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {timestamp && (
          <div className={`text-xs mt-2 opacity-75 ${getTextStyle()}`}>
            {timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
