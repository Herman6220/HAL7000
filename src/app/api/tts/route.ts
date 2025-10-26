import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";



const elevenlabs = new ElevenLabsClient();

export async function POST(req: Request) {

    const { text } = await req.json();

    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
    });

    return new Response(audioStream, {
        headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
        },
    });
}