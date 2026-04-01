import { Code, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  title: string;
  language: string;
  code: string;
  description: string;
  defaultOpen?: boolean;
}

function CodeBlock({ title, language, code, description, defaultOpen = false }: CodeBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm text-gray-800">{title}</span>
          <span className="text-[10px] font-mono bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            {language}
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div>
          <p className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">{description}</p>
          <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export function ApiReference() {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
          API & Integration Reference
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Key code patterns for each pipeline stage
        </p>
      </div>

      <div className="p-6 space-y-4">
        <CodeBlock
          title="1. Extract Meeting ID"
          language="TypeScript"
          description="Parse Zoom meeting link to extract the numeric meeting ID and password parameters."
          defaultOpen={true}
          code={`function extractMeetingId(link: string) {
  const url = new URL(link);
  // Zoom links: /j/{meetingId}?pwd={password}
  const match = url.pathname.match(/\\/j\\/(\\d+)/);
  const meetingId = match?.[1];
  const password = url.searchParams.get('pwd') || '';
  return { meetingId, password };
}

// Example:
// "https://zoom.us/j/8549213067?pwd=Q3RsT2x5bGhVZz09"
// → { meetingId: "8549213067", password: "Q3RsT2x5bGhVZz09" }`}
        />

        <CodeBlock
          title="2. Zoom Meeting SDK — Bot Join"
          language="JavaScript"
          description="Use Zoom's Meeting SDK to programmatically join a meeting as a bot participant."
          code={`import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

const client = ZoomMtgEmbedded.createClient();
await client.init({ zoomAppRoot: document.getElementById('zoom-root') });

await client.join({
  sdkKey: process.env.ZOOM_SDK_KEY,
  signature: generateSignature(meetingId, role),
  meetingNumber: meetingId,
  password: meetingPassword,
  userName: botDisplayName,
});

// Listen for audio stream
client.on('audio-statistic-data-change', (payload) => {
  // Access mixed audio data for recording
  audioRecorder.write(payload.data);
});`}
        />

        <CodeBlock
          title="3. Audio Capture & Recording"
          language="TypeScript"
          description="Capture the mixed audio stream and save as WAV format for transcription."
          code={`class AudioRecorder {
  private chunks: Float32Array[] = [];
  private sampleRate = 16000;

  write(data: Float32Array) {
    this.chunks.push(new Float32Array(data));
  }

  async toWavBlob(): Promise<Blob> {
    const totalLength = this.chunks.reduce((s, c) => s + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return encodeWAV(merged, this.sampleRate);
  }
}`}
        />

        <CodeBlock
          title="4. OpenAI Transcription with Diarization"
          language="TypeScript"
          description="Send audio to OpenAI's transcription endpoint with diarization enabled. Returns speaker-labeled segments with timing metadata."
          code={`const response = await openai.audio.transcriptions.create({
  file: audioFile,                    // WAV/MP3 audio
  model: "gpt-4o-transcribe",
  response_format: "diarized_json",   // Enable diarization
});

// Response shape (diarized_json):
{
  "segments": [
    {
      "speaker": "Speaker 1",     // Diarized speaker label
      "start": 0.0,               // Start time in seconds
      "end": 8.2,                 // End time in seconds
      "text": "Good morning everyone..."
    },
    {
      "speaker": "Speaker 2",
      "start": 8.5,
      "end": 18.1,
      "text": "Thanks Sarah..."
    }
  ]
}`}
        />

        <CodeBlock
          title="5. Document Generation"
          language="TypeScript"
          description="Format the diarized transcript into PDF and Markdown reports with summaries and action items."
          code={`import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function generateReport(segments: DiarizedSegment[]) {
  const doc = new jsPDF();
  
  // Add meeting metadata
  doc.text(meetingTitle, 14, 20);
  doc.text(\`Date: \${dateStr}\`, 14, 30);
  
  // Add transcript table with speaker labels
  autoTable(doc, {
    head: [['Time', 'Speaker', 'Text']],
    body: segments.map(s => [
      \`\${formatTime(s.start)} - \${formatTime(s.end)}\`,
      s.speaker,
      s.text,
    ]),
  });

  doc.save('meeting-transcript.pdf');
}`}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://developers.zoom.us/docs/meeting-sdk/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            Zoom Meeting SDK Docs
          </a>
          <a
            href="https://platform.openai.com/docs/api-reference/audio/createTranscription"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            OpenAI Transcription API
          </a>
        </div>
      </div>
    </div>
  );
}
