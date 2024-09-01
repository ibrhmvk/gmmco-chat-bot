import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button } from '../../button';
import { Play, Pause, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  isGenerating: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, isGenerating }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAudio = async () => {
    if (audioUrl || isFetching) return;
    setIsFetching(true);
    try {
      const response = await axios.post('/api/text-to-speech', { text }, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      setAudioUrl(URL.createObjectURL(blob));
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    if (text && !isGenerating) {
      fetchAudio();
    }
  }, [text, isGenerating]);

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
    <div className="flex items-center">
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}
      <Button onClick={togglePlayPause} variant="outline" size="sm" disabled={isGenerating || isFetching}>
        {isFetching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default AudioPlayer;
