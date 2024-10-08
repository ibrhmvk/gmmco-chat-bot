import { Check, Copy } from "lucide-react";

import { Message } from "ai";
import { Fragment, useEffect, useState } from "react";
import { Button } from "../../button";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import {
  ChatHandler,
  DocumentFileData,
  EventData,
  ImageData,
  MessageAnnotation,
  MessageAnnotationType,
  SuggestedQuestionsData,
  ToolData,
  getAnnotationData,
  getSourceAnnotationData,
} from "../index";
import AudioPlayer from "./AudioPlayer";
import ChatAvatar from "./chat-avatar";
import { ChatFiles } from "./chat-files";
import { ChatImage } from "./chat-image";
import ChatTools from "./chat-tools";
import Markdown from "./markdown";
import axios from "axios";

type ContentDisplayConfig = {
  order: number;
  component: JSX.Element | null;
};

async function translateToHindi(text: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Translate the following text to Hindi: ${text}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Fallback to original text if translation fails
  }
}

function ChatMessageContent({
  message,
  isLoading,
  append,
}: {
  message: Message;
  isLoading: boolean;
  append: Pick<ChatHandler, "append">["append"];
}) {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isMessageComplete, setIsMessageComplete] = useState(false);
  const [isAudioPlayerReady, setIsAudioPlayerReady] = useState(false);

  const userDataString = localStorage.getItem("user_data");
  const userData = userDataString ? JSON.parse(userDataString) : null;

  useEffect(() => {
    if (!isLoading && message.role === "assistant") {
      setIsMessageComplete(true);
    }
  }, [isLoading, message.role]);

  useEffect(() => {
    async function processContent() {
      if (isMessageComplete && !isTranslating && message.role === "assistant" && !isAudioPlayerReady) {
        setIsTranslating(true);
        let content = message.content;
        if (userData?.language === "hi") {
          content = await translateToHindi(message.content);
        }
        setTranslatedContent(content);
        setIsTranslating(false);
        setIsAudioPlayerReady(true);
      }
    }

    processContent();
  }, [message.content, message.role, isMessageComplete, isAudioPlayerReady, userData?.language]);

  const annotations = message.annotations as MessageAnnotation[] | undefined;
  if (!annotations?.length) return <Markdown content={message.content} />;

  const imageData = getAnnotationData<ImageData>(
    annotations ?? [],
    MessageAnnotationType.IMAGE,
  );
  const contentFileData = getAnnotationData<DocumentFileData>(
    annotations,
    MessageAnnotationType.DOCUMENT_FILE,
  );
  const eventData = getAnnotationData<EventData>(
    annotations,
    MessageAnnotationType.EVENTS,
  );

  const sourceData = getSourceAnnotationData(annotations);

  const toolData = getAnnotationData<ToolData>(
    annotations,
    MessageAnnotationType.TOOLS,
  );
  const suggestedQuestionsData = getAnnotationData<SuggestedQuestionsData>(
    annotations,
    MessageAnnotationType.SUGGESTED_QUESTIONS,
  );

  const contents: ContentDisplayConfig[] = [
    {
      order: 1,
      component: imageData[0] ? <ChatImage data={imageData[0]} /> : null,
    },
    {
      order: -3,
      component:
        eventData.length > 0 ? (
          // <ChatEvents isLoading={isLoading} data={eventData} />
          <></>
        ) : null,
    },
    {
      order: 2,
      component: contentFileData[0] ? (
        <ChatFiles data={contentFileData[0]} />
      ) : null,
    },
    {
      order: -1,
      component: toolData[0] ? <ChatTools data={toolData[0]} /> : null,
    },
    {
      order: 0,
      component: <Markdown content={message.content} sources={sourceData[0]} />,
    },
    {
      order: 3,
      component: sourceData[0] ? (
        // <ChatSources data={sourceData[0]} />
        <></>
      ) : null,
    },
    {
      order: 4,
      component:
      message.role === "assistant" && isAudioPlayerReady ? (
        <AudioPlayer
          text={removeImageLinks(translatedContent!)}
          isGenerating={isTranslating}
        />
      ) : null,
    },
    {
      order: -2,
      component:
        <></>
    },
  ];
  return (
    <div className="flex-1 gap-4 flex flex-col">
      {contents
        .sort((a, b) => a.order - b.order)
        .map((content) => content.component && <Fragment key={content.order}>{content.component}</Fragment>)}
    </div>
  );
}

function removeImageLinks(content: string): string {
  return content.replace(/!\[.*?\]\(.*?\)/g, "");
}

export default function ChatMessage({
  chatMessage,
  isLoading,
  append,
}: {
  chatMessage: Message;
  isLoading: boolean;
  append: Pick<ChatHandler, "append">["append"];
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  return (
    <div className="flex items-start gap-4 pr-5 pt-5">
      <ChatAvatar role={chatMessage.role} />
      <div className="group flex flex-1 justify-between gap-2">
        <ChatMessageContent
          message={chatMessage}
          isLoading={isLoading}
          append={append}
        />
        <Button
          onClick={() => copyToClipboard(chatMessage.content)}
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
