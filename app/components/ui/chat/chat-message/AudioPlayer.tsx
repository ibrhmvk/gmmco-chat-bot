import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useAudio } from '../../../../context/AudioContext';

interface AudioPlayerProps {
  text: string;
  isGenerating: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isGenerating }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const { isPlaying, setIsPlaying, audioRef } = useAudio() as {
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  };

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
  }, [isAudioReady, setIsPlaying, audioRef]);

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
      {/* Add your play/pause button here, using the togglePlayPause function */}
    </>
  );
};

export default AudioPlayer;
