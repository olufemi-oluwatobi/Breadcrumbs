import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, FileText, Film, Sparkles, Eye, Play, Users } from "lucide-react";

interface WorkflowStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'active' | 'pending';
}

interface WorkflowSidebarProps {
  currentStep: number;
  progressPercentage: number;
  className?: string;
}

export function WorkflowSidebar({ currentStep, progressPercentage, className }: WorkflowSidebarProps) {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: "Script & Audio",
      subtitle: "Upload your content",
      icon: FileText,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      id: 2,
      title: "Media Collection",
      subtitle: "Videos, images, audio",
      icon: Film,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 3,
      title: "Frame Extraction",
      subtitle: "Process video frames",
      icon: Users,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    },
    {
      id: 4,
      title: "AI Synthesis",
      subtitle: "Combine materials",
      icon: Sparkles,
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'pending'
    },
    {
      id: 5,
      title: "Storyboard Preview",
      subtitle: "Review & adjust",
      icon: Eye,
      status: currentStep > 5 ? 'completed' : currentStep === 5 ? 'active' : 'pending'
    },
    {
      id: 6,
      title: "Final Video",
      subtitle: "Export & download",
      icon: Play,
      status: currentStep > 6 ? 'completed' : currentStep === 6 ? 'active' : 'pending'
    }
  ];

  return (
    <div className={`w-80 bg-white shadow-lg border-r border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-800 flex items-center">
          <Film className="text-blue-600 mr-2" size={20} />
          VideoChat Pro
        </h2>
        <p className="text-sm text-gray-600 mt-1">AI-Powered Video Editor</p>
      </div>
      
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Workflow Progress</h3>
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center p-3 rounded-lg transition-all ${
                  step.status === 'active'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : step.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    step.status === 'active'
                      ? 'bg-white'
                      : step.status === 'completed'
                      ? 'bg-green-100'
                      : 'bg-gray-300'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <Icon
                      className={
                        step.status === 'active'
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium text-sm ${
                      step.status === 'active'
                        ? 'text-white'
                        : step.status === 'completed'
                        ? 'text-green-800'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`text-xs ${
                      step.status === 'active'
                        ? 'text-blue-100'
                        : step.status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.subtitle}
                  </div>
                </div>
                {step.status === 'completed' && (
                  <CheckCircle className="text-green-600 ml-2" size={16} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Overall Progress */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">Overall Progress</span>
            <Badge variant="secondary" className="text-blue-700 bg-blue-100">
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </Card>
      </div>
    </div>
  );
}
