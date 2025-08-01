"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import React from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, title = "FinHubIQ Demo" }: VideoModalProps) {
  const [videoError, setVideoError] = React.useState(false);

  const handleVideoError = () => {
    setVideoError(true);
    console.error('Video failed to load:', videoUrl);
  };

  const handleClose = () => {
    setVideoError(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video">
          {!videoError ? (
            <video
              controls
              className="w-full h-full rounded-lg"
              autoPlay={true}
              preload="auto"
              onError={handleVideoError}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/quicktime" />
              <source src={videoUrl} type="video/mov" />
              <source src={videoUrl} type="video/webm" />
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Video Not Available</h3>
                <p className="mb-4">The demo video could not be loaded.</p>
                <p className="text-sm">Please ensure the video file is uploaded to Supabase storage.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DemoButtonProps {
  videoUrl: string;
  title?: string;
}

export function DemoButton({ videoUrl, title }: DemoButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button 
        size="lg" 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        Watch Demo
      </Button>
      <VideoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        videoUrl={videoUrl}
        title={title}
      />
    </>
  );
} 