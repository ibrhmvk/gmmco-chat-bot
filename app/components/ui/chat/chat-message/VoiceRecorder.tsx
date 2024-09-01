import React, { useState, useRef } from 'react';
import { Button } from "../../button";
import { Mic, Square } from "lucide-react";
import axios from 'axios';
import { useAudio } from '../../../../context/AudioContext';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, onRecordingStart, onRecordingStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { isPlaying, stopAudio } = useAudio();

  const startRecording = async () => {
    if (isPlaying) {
      stopAudio();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      onRecordingStart();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStop();
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];

    const formData = new FormData();
    formData.append("model", "whisper-1");
    formData.append("file", audioBlob, "audio.webm");

    try {
      const { data: translationData } = await axios.post(
        "https://api.openai.com/v1/audio/translations",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onTranscription(translationData.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      variant="outline"
      size="icon"
    >
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceRecorder;
