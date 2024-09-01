import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAudio } from '../../../../context/AudioContext';

interface AudioPlayerProps {
  text: string;
  isGenerating: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isGenerating }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { isPlaying, setIsPlaying, audioRef } = useAudio();

  const fetchAudio = async () => {
    if (audioUrl || isFetching) return;
    setIsFetching(true);
    try {
      const response = await axios.post(
        "/api/text-to-speech",
        { text },
        { responseType: "arraybuffer" },
      );
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    if (text && !isGenerating) {
      fetchAudio();
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
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
        />
      )}
    </>
  );
};

export default AudioPlayer;
