import { JSONValue } from "ai";
import { useRef, useState } from "react";
import { Button } from "../button";
import { DocumentPreview } from "../document-preview";
import UploadImagePreview from "../upload-image-preview";
import VoiceRecorder from "./chat-message/VoiceRecorder";
import { ChatHandler } from "./chat.interface";
import { useFile } from "./hooks/use-file";
import { LlamaCloudSelector } from "./widgets/LlamaCloudSelector";

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "csv", "pdf", "txt", "docx"];

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | "isLoading"
    | "input"
    | "onFileUpload"
    | "onFileError"
    | "handleSubmit"
    | "handleInputChange"
    | "messages"
    | "setInput"
    | "append"
  > & {
    requestParams?: any;
    setRequestData?: React.Dispatch<any>;
  },
) {
  const {
    imageUrl,
    setImageUrl,
    uploadFile,
    files,
    removeDoc,
    reset,
    getAnnotations,
  } = useFile();

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscriptionReady, setIsTranscriptionReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmitWithAnnotations = (
    e: React.FormEvent<HTMLFormElement>,
    annotations: JSONValue[] | undefined,
  ) => {
    e.preventDefault();
    props.append!({
      content: props.input,
      role: "user",
      createdAt: new Date(),
      annotations,
    });
    props.setInput!("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsTranscriptionReady(false);
    const annotations = getAnnotations();
    if (annotations.length) {
      handleSubmitWithAnnotations(e, annotations);
      return reset();
    }
    props.handleSubmit(e);
  };

  const handleUploadFile = async (file: File) => {
    if (imageUrl || files.length > 0) {
      alert("You can only upload one file at a time.");
      return;
    }
    try {
      await uploadFile(file, props.requestParams);
      props.onFileUpload?.(file);
    } catch (error: any) {
      const onFileUploadError = props.onFileError || window.alert;
      onFileUploadError(error.message);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    props.setInput!(text);
    setIsTranscriptionReady(true);
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-xl bg-white p-4 shadow-xl space-y-4 shrink-0"
    >
      {imageUrl && (
        <UploadImagePreview url={imageUrl} onRemove={() => setImageUrl(null)} />
      )}
      {files.length > 0 && (
        <div className="flex gap-4 w-full overflow-auto py-2">
          {files.map((file) => (
            <DocumentPreview
              key={file.id}
              file={file}
              onRemove={() => removeDoc(file)}
            />
          ))}
        </div>
      )}
      <div className="flex w-full items-start justify-center gap-4 ">
        <VoiceRecorder
          onTranscription={handleVoiceTranscription}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
        />
        {process.env.NEXT_PUBLIC_USE_LLAMACLOUD === "true" &&
          props.setRequestData && (
            <LlamaCloudSelector setRequestData={props.setRequestData} />
          )}
        {isTranscriptionReady && (
          <Button
            type="submit"
            disabled={props.isLoading || !props.input.trim()}
          >
            Send message
          </Button>
        )}
      </div>
    </form>
  );
}
