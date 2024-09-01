'use client';

import { AudioProvider } from '../context/AudioContext';
import ChatSection from './chat-section';

export default function ClientWrapper() {
  return (
    <AudioProvider>
      <ChatSection />
    </AudioProvider>
  );
}