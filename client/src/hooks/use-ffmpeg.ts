import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type UseFFmpegProps = {
  onFrameExtracted?: (frameUrl: string, frameNumber: number) => void;
  onError?: (error: Error) => void;
};

type UseFFmpegReturn = {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  frames: string[];
  currentFrame: number;
  totalFrames: number;
  extractionTime: number;
  loadFFmpeg: () => Promise<void>;
  extractFrames: (videoFile: File, fps: number) => Promise<void>;
  clearFrames: () => void;
};

export const useFFmpeg = ({
  onFrameExtracted,
  onError,
}: UseFFmpegProps = {}): UseFFmpegReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [extractionTime, setExtractionTime] = useState<number>(0);
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // Cleanup function to revoke object URLs
  const cleanup = useCallback(() => {
    cleanupRef.current.forEach(revoke => revoke());
    cleanupRef.current = [];
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      loadFFmpeg();
    }
  }, []);

  const loadFFmpeg = useCallback(async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      setIsLoaded(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load FFmpeg');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading, onError]);

  const extractFrames = useCallback(async (videoFile: File, fps: number = 1) => {
    if (!isLoaded || !ffmpegRef.current) {
      throw new Error('FFmpeg is not loaded');
    }
    
    setIsLoading(true);
    setError(null);
    cleanup(); // Clean up previous frames
    const startTime = performance.now();
    
    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input-video';
      const outputPattern = 'frame-%04d.png';
      
      // Write the video file to FFmpeg's virtual filesystem
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      
      // Extract frames at specified FPS
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', `fps=${fps}`,
        outputPattern
      ]);
      
      // Get list of generated frames
      const files = await ffmpeg.listDir('/');
      const frameFiles = files
        .filter(file => file.name.startsWith('frame-') && file.name.endsWith('.png'))
        .sort();
      
      setTotalFrames(frameFiles.length);
      
      // Read each frame and create object URLs
      const newFrames: string[] = [];
      
      for (let i = 0; i < frameFiles.length; i++) {
        const frameData = await ffmpeg.readFile(frameFiles[i].name);
        const blob = new Blob([frameData as unknown as ArrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        
        // Store cleanup function
        cleanupRef.current.push(() => URL.revokeObjectURL(url));
        
        newFrames.push(url);
        setCurrentFrame(i + 1);
        onFrameExtracted?.(url, i);
      }
      
      const endTime = performance.now();
      setExtractionTime(endTime - startTime);
      setFrames(newFrames);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to extract frames');
      setError(error.message);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, onFrameExtracted, onError, cleanup]);

  const clearFrames = useCallback(() => {
    cleanup();
    setFrames([]);
    setCurrentFrame(0);
    setTotalFrames(0);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (ffmpegRef.current) {
        ffmpegRef.current.terminate();
      }
    };
  }, [cleanup]);

  return {
    isLoaded,
    isLoading,
    error,
    frames,
    currentFrame,
    totalFrames,
    extractionTime,
    loadFFmpeg,
    extractFrames,
    clearFrames,
  };
};

export default useFFmpeg;
