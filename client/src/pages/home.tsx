import { useState, useCallback, useEffect } from "react";
import { WorkflowSidebar } from "@/components/chat/workflow-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'progress' | 'success' | 'error' | 'processing';
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const {
    isLoaded,
    isLoading,
    error,
    frames,
    currentFrame,
    totalFrames,
    extractionTime,
    extractFrames,
    clearFrames
  } = useFFmpeg({
    onFrameExtracted: (frameUrl, frameNumber) => {
      // Update progress message in real-time
      setMessages(prev => prev.map(msg => 
        msg.type === 'progress' && msg.metadata?.isFrameExtraction
          ? {
              ...msg,
              metadata: {
                ...msg.metadata,
                currentFrame: frameNumber + 1,
                progress: ((frameNumber + 1) / totalFrames) * 100
              }
            }
          : msg
      ));
    },
    onError: (error) => {
      addMessage('error', `Frame extraction failed: ${error.message}`);
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Add welcome message on component mount
  useEffect(() => {
    addMessage('system', "👋 Welcome to VideoChat Pro! I'm your AI video editing assistant. Let's create something amazing together!\n\nTo get started, please upload your script and any audio files you'd like to include.");
  }, []);

  // Update progress percentage based on current step
  const progressPercentage = (currentStep / 6) * 100;

  const addMessage = useCallback((type: ChatMessage['type'], content: string, metadata?: Record<string, any>) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      metadata,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    addMessage('user', content);
    
    // Simple AI responses based on content
    setTimeout(() => {
      if (content.toLowerCase().includes('help')) {
        addMessage('system', "I'm here to help! You can upload files, ask questions about the video editing process, or request specific adjustments to your project.");
      } else if (content.toLowerCase().includes('status')) {
        addMessage('system', `Your project is currently at step ${currentStep} of 6. ${
          currentStep === 1 ? "Please upload your script and audio files to continue." :
          currentStep === 2 ? "Upload your media files (videos, images, audio)." :
          currentStep === 3 ? "Ready for frame extraction from your videos." :
          "Processing your content..."
        }`);
      } else {
        addMessage('system', "I understand you want to work on your video project. Please upload the necessary files for the current step, and I'll guide you through the process!");
      }
    }, 1000);
  }, [addMessage, currentStep]);

  const handleFileUpload = useCallback(async (files: File[], step: number) => {
    setUploadedFiles(prev => [...prev, ...files]);

    // Show success message with file details
    const fileDetails = files.map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    }));

    addMessage('success', `Great! I've received your files:`, {
      files: fileDetails
    });

    // Process based on step
    if (step === 1) {
      // Script and audio files
      setTimeout(() => {
        addMessage('system', "Perfect! Now let's collect your media files. Please upload any videos, images, or additional audio you want to include in your project.");
        setCurrentStep(2);
      }, 1500);
    } else if (step === 2) {
      // Media files - check for videos to extract frames
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      
      if (videoFiles.length > 0) {
        setTimeout(() => {
          addMessage('system', "Excellent! I found video files in your upload. Let me extract frames for processing.");
          setCurrentStep(3);
          processVideoFiles(videoFiles);
        }, 1500);
      } else {
        setTimeout(() => {
          addMessage('system', "Files uploaded successfully! Since no videos were detected, we can proceed to the synthesis stage.");
          setCurrentStep(4);
        }, 1500);
      }
    }
  }, [addMessage]);

  const processVideoFiles = useCallback(async (videoFiles: File[]) => {
    for (const videoFile of videoFiles) {
      try {
        // Add progress message
        addMessage('progress', `🎬 Extracting frames from your video...`, {
          isFrameExtraction: true,
          filename: videoFile.name,
          currentFrame: 0,
          totalFrames: 0,
          extractionTime: 0,
          fps: 1,
          progress: 0
        });

        // Start frame extraction
        await extractFrames(videoFile, 1);

        // Show completion message with frame preview
        addMessage('success', `✨ Frame extraction complete! Here's a preview:`, {
          frames: frames.slice(0, 6), // Show first 6 frames
          totalFrames: frames.length
        });

        // Move to next step
        setTimeout(() => {
          addMessage('processing', "🤖 AI is synthesizing your materials...\n\nAnalyzing script, matching audio, and organizing visual elements");
          setCurrentStep(4);
        }, 2000);

      } catch (error) {
        console.error('Frame extraction failed:', error);
      }
    }
  }, [addMessage, extractFrames, frames]);

  const ffmpegStatus = isLoading ? 'loading' : error ? 'error' : isLoaded ? 'loaded' : 'loading';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarVisible ? 'block' : 'hidden'} lg:block`}>
        <WorkflowSidebar
          currentStep={currentStep}
          progressPercentage={progressPercentage}
        />
      </div>

      {/* Main Chat Interface */}
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        currentStep={currentStep}
        ffmpegStatus={ffmpegStatus}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        className="flex-1"
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}
    </div>
  );
}
