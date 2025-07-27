import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Film, Music, Image } from "lucide-react";

interface UploadZoneProps {
  onFileUpload: (files: File[]) => void;
  acceptedTypes: string[];
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  multiple?: boolean;
}

export function UploadZone({
  onFileUpload,
  acceptedTypes,
  title,
  subtitle,
  icon: Icon = Upload,
  className,
  multiple = true
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      acceptedTypes.some(type => file.type.includes(type) || file.name.endsWith(type))
    );
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [onFileUpload, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const getFileTypeIcon = (type: string) => {
    if (type.includes('video')) return <Film className="text-blue-600" size={16} />;
    if (type.includes('audio')) return <Music className="text-green-600" size={16} />;
    if (type.includes('image')) return <Image className="text-purple-600" size={16} />;
    return <FileText className="text-gray-600" size={16} />;
  };

  const getSupportedTypesText = () => {
    const typeMap: Record<string, string> = {
      'video': 'MP4, MOV, AVI',
      'audio': 'MP3, WAV, M4A',
      'image': 'JPG, PNG, GIF',
      'text': 'TXT, DOC, PDF'
    };
    
    return acceptedTypes.map(type => {
      const key = Object.keys(typeMap).find(k => type.includes(k));
      return key ? typeMap[key] : type.toUpperCase();
    }).join(', ');
  };

  return (
    <Card
      className={`upload-zone border-2 border-dashed p-6 transition-all cursor-pointer ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        id={fileInputId}
      />
      
      <label htmlFor={fileInputId} className="cursor-pointer">
        <div className="text-center">
          <Icon className={`mx-auto mb-2 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
          <p className="text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-gray-400 text-sm mb-3">{subtitle}</p>
          <Button 
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(fileInputId)?.click();
            }}
          >
            Choose Files
          </Button>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Supported: {getSupportedTypesText()}
        </div>
      </label>
    </Card>
  );
}
