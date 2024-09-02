import axios from "axios";
import { Mic, Square, StopCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAudio } from "../../../../context/AudioContext";
import { Button } from "../../button";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  onRecordingStart,
  onRecordingStop,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // State to track audio playing
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
      console.error("Error accessing microphone:", error);
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
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
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
        },
      );

      onTranscription(translationData.text);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  const handleAudioPlay = () => {
    setIsAudioPlaying(true);
  };

  const handleAudioStop = () => {
    stopAudio();
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    if (isPlaying) {
      handleAudioPlay();
    } else {
      setIsAudioPlaying(false);
    }
  }, [isPlaying]);

  return (
    <>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant="outline"
        size="icon"
      >
        {isRecording ? (
          <Square className="h-4 w-4 " />
        ) : (
          <Mic className="h-4 w-4 " />
        )}
      </Button>
      {isAudioPlaying && (
        <Button onClick={handleAudioStop} size="icon" variant="outline">
          <StopCircle className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};

export default VoiceRecorder;
