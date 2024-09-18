import axios from "axios";
import { StopCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAudio } from "../../../../context/AudioContext";
import { Button } from "../../button";

interface AudioPlayerProps {
  text: string;
  isGenerating: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isGenerating }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { isPlaying, setIsPlaying, audioRef } = useAudio();
  const fetchRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const userDataString = localStorage.getItem("user_data");
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const fetchAudio = async (newText: string) => {
    setIsLoading(true);
    setIsGeneratingAudio(true);
    abortControllerRef.current = new AbortController();
    try {
      const response = await axios.post(
        "/api/text-to-speech",
        { text: newText, language: userData.language },
        {
          responseType: "arraybuffer",
          signal: abortControllerRef.current.signal,
        },
      );
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Audio generation cancelled");
      } else {
        console.error("Error fetching audio:", error);
      }
    } finally {
      fetchRef.current = false;
      setIsLoading(false);
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    if (text && !isGenerating && !fetchRef.current) {
      fetchRef.current = true;
      fetchAudio(text);
    }
  }, [text, isGenerating]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
      setIsPlaying(true);
    }
  }, [audioUrl, setIsPlaying, audioRef]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGeneratingAudio(false);
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center gap-2">
          <div className="relative inline-flex">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-full absolute top-0 left-0 animate-ping"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-full absolute top-0 left-0 animate-pulse"></div>
          </div>
          {isGeneratingAudio && (
            <Button
              onClick={handleStopGeneration}
              variant="outline"
              size="icon"
              className="ml-2"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        audioUrl && (
          <audio
            ref={audioRef as React.RefObject<HTMLAudioElement>}
            src={audioUrl}
            onEnded={handleAudioEnded}
          />
        )
      )}
    </>
  );
};

export default AudioPlayer;
