import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
    console.error('NEXT_PUBLIC_ELEVENLABS_API_KEY is not set');
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        text: text,
        model_id: "eleven_turbo_v2_5",
        language_code: "hi",
      },
      {
        headers: {
          "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: 'arraybuffer',
      }
    );

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error fetching audio:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      return NextResponse.json({ error: `Failed to generate audio: ${error.message}` }, { status: error.response?.status || 500 });
    }
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}