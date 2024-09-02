import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useAudio } from '../../../../context/AudioContext';

interface AudioPlayerProps {
  text: string;
  isGenerating: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isGenerating }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { isPlaying, setIsPlaying, audioRef } = useAudio();
  const fetchRef = useRef(false); // Ref to track if the API call is in progress or done

  const fetchAudio = async (newText: string) => {
    try {
      const response = await axios.post(
        "/api/text-to-speech",
        { text: newText },
        { responseType: "arraybuffer" },
      );
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      fetchRef.current = false; // Reset the fetch status
    }
  };

  useEffect(() => {
    if (text && !isGenerating && !fetchRef.current) {
      fetchRef.current = true; // Set fetch status to true before making the API call
      fetchAudio(text);
    }
  }, [text, isGenerating]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      setIsPlaying(true);
    }
  }, [audioUrl, setIsPlaying, audioRef]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <>
      {audioUrl && (
        <audio
          ref={audioRef as React.RefObject<HTMLAudioElement>}
          src={audioUrl}
          onEnded={handleAudioEnded}
        />
      )}
    </>
  );
};

export default AudioPlayer;
