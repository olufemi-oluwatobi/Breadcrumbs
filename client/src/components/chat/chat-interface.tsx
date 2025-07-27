import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageBubble, MessageType } from "./message-bubble";
import { UploadZone } from "./upload-zone";
import { Send, Paperclip, Mic, Menu, CheckCircle, MoreVertical } from "lucide-react";

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onFileUpload: (files: File[], step: number) => void;
  currentStep: number;
  ffmpegStatus: 'loading' | 'loaded' | 'error';
  onToggleSidebar?: () => void;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onFileUpload,
  currentStep,
  ffmpegStatus,
  onToggleSidebar,
  className
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFFmpegStatusBadge = () => {
    switch (ffmpegStatus) {
      case 'loaded':
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            <CheckCircle className="mr-1" size={12} />
            FFmpeg Ready
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">
            Loading FFmpeg...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="secondary" className="text-red-700 bg-red-100">
            FFmpeg Error
          </Badge>
        );
    }
  };

  const getUploadZoneProps = () => {
    switch (currentStep) {
      case 1:
        return {
          acceptedTypes: ['text', 'audio', '.txt', '.doc', '.pdf', '.mp3', '.wav', '.m4a'],
          title: "Drop your script & audio files here",
          subtitle: "or click to browse"
        };
      case 2:
        return {
          acceptedTypes: ['video', 'image', 'audio', '.mp4', '.mov', '.avi', '.jpg', '.png', '.mp3', '.wav'],
          title: "Upload your media files",
          subtitle: "Videos, images, and audio"
        };
      default:
        return null;
    }
  };

  const uploadZoneProps = getUploadZoneProps();

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-3"
              onClick={onToggleSidebar}
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-lg font-medium text-gray-800">Video Editor Assistant</h1>
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              Online
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {getFFmpegStatusBadge()}
            <Button variant="ghost" size="sm">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 chat-container overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            type={message.type}
            content={message.content}
            metadata={message.metadata}
            timestamp={message.timestamp}
          />
        ))}

        {/* Upload Zone - shown based on current step */}
        {uploadZoneProps && (
          <div className="message-bubble flex justify-end">
            <UploadZone
              {...uploadZoneProps}
              onFileUpload={(files) => onFileUpload(files, currentStep)}
              className="max-w-md"
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Paperclip size={20} />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Ask me anything about your video project..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl border-0 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-full bg-transparent border-0 shadow-none"
            >
              <Send size={16} />
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Mic size={20} />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          AI can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
}
