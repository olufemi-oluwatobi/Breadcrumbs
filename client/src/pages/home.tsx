import { useState, useCallback, useEffect } from "react";
import { WorkflowSidebar } from "@/components/chat/workflow-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
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
  const [processingStep, setProcessingStep] = useState<'idle' | 'synthesis' | 'storyboard' | 'timeline'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  // Add welcome message on component mount
  useEffect(() => {
    addMessage('system', "👋 Welcome to VideoChat Pro! I'm your AI video editing assistant. Let's create something amazing together!\n\nTo get started, you can:\n• Type your script directly in the chat\n• Upload script files and audio files\n• Or upload any initial content you have");
  }, []);

  // Update progress percentage based on current step
  const progressPercentage = (currentStep / 6) * 100;

  const addMessage = useCallback((type: ChatMessage['type'], content: string, metadata?: Record<string, any>) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      metadata,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    addMessage('user', content);
    
    // Handle text content as script input for step 1
    if (currentStep === 1) {
      setTimeout(() => {
        addMessage('success', "Great! I've received your script content:", {
          scriptText: content
        });
        setTimeout(() => {
          addMessage('system', "Perfect! Now please upload any audio files you want to include, or proceed to the next step by uploading your media files.");
        }, 1500);
      }, 800);
      return;
    }
    
    // Simple AI responses based on content for other steps
    setTimeout(() => {
      if (content.toLowerCase().includes('help')) {
        addMessage('system', "I'm here to help! You can upload files, ask questions about the video editing process, or request specific adjustments to your project.");
      } else if (content.toLowerCase().includes('status')) {
        addMessage('system', `Your project is currently at step ${currentStep} of 6. ${
          currentStep === 1 ? "Send me your script text or upload script/audio files to continue." :
          currentStep === 2 ? "Upload your media files (videos, images, audio). You can upload multiple files." :
          currentStep === 3 ? "Ready for AI synthesis of your materials." :
          "Processing your content..."
        }`);
      } else if (content.toLowerCase().includes('next') || content.toLowerCase().includes('continue')) {
        if (currentStep === 1) {
          addMessage('system', "Moving to media collection. Please upload your videos, images, and additional audio files.");
          setCurrentStep(2);
        } else if (currentStep === 2) {
          showConfirmationPrompt();
        }
      } else if (content.toLowerCase().includes('proceed') || content.toLowerCase().includes('yes')) {
        if (showConfirmation) {
          setShowConfirmation(false);
          addMessage('system', "Excellent! Starting AI synthesis process...");
          setCurrentStep(3);
          setTimeout(() => startAISynthesis(), 1000);
        } else {
          addMessage('system', "I understand you want to work on your video project. Please upload the necessary files for the current step, and I'll guide you through the process!");
        }
      } else if (content.toLowerCase().includes('no') || content.toLowerCase().includes('cancel')) {
        if (showConfirmation) {
          setShowConfirmation(false);
          addMessage('system', "No problem! You can continue uploading more files. Type 'next' when you're ready to proceed to AI synthesis.");
        } else {
          addMessage('system', "I understand you want to work on your video project. Please upload the necessary files for the current step, and I'll guide you through the process!");
        }
      } else {
        addMessage('system', "I understand you want to work on your video project. Please upload the necessary files for the current step, and I'll guide you through the process!");
      }
    }, 1000);
  }, [addMessage, currentStep, showConfirmation]);

  const showConfirmationPrompt = useCallback(() => {
    setShowConfirmation(true);
    addMessage('system', "⚠️ Important Notice\n\nOnce we proceed to AI synthesis, you won't be able to go back and change your files. You'll need to restart the entire process if you want to make changes.\n\nCurrent files uploaded: " + uploadedFiles.length + " files\n\nAre you ready to proceed? Type 'yes' to continue or 'no' to upload more files.", {
      confirmation: true,
      fileCount: uploadedFiles.length
    });
  }, [addMessage, uploadedFiles.length]);

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
      // Media files - allow multiple uploads
      setTimeout(() => {
        addMessage('system', "Great! I've added these files to your project. You can upload more media files, or type 'next' when you're ready to proceed to AI synthesis.");
      }, 1500);
    }
  }, [addMessage]);

  const startAISynthesis = useCallback(async () => {
    setProcessingStep('synthesis');
    
    // Show AI synthesis progress
    addMessage('processing', "🤖 AI is analyzing your materials...\n\nAnalyzing script, matching audio, and organizing visual elements");
    
    // Simulate AI processing stages
    setTimeout(() => {
      addMessage('progress', "🎯 Creating storyboard structure...", {
        progress: 25,
        stage: "Storyboard Generation"
      });
      setProcessingStep('storyboard');
    }, 2000);

    setTimeout(() => {
      addMessage('progress', "🎨 Designing visual timeline...", {
        progress: 50,
        stage: "Timeline Creation"
      });
      setProcessingStep('timeline');
    }, 4000);

    setTimeout(() => {
      addMessage('success', "✨ AI synthesis complete! Here's your storyboard and timeline preview:", {
        storyboard: true,
        timeline: true
      });
      setCurrentStep(5);
      setProcessingStep('idle');
    }, 6000);
  }, [addMessage]);

  const ffmpegStatus = 'loaded'; // Always show as loaded since we removed FFmpeg

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
