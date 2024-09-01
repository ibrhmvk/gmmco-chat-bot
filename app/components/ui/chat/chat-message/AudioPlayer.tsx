import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  text: string;
  isGenerating: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isGenerating }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      setIsAudioReady(true);
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
    if (isAudioReady && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setIsAudioReady(false);
    }
  }, [isAudioReady]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </>
  );
};

export default AudioPlayer;
