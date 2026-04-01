import { useRef, useState } from 'react';
import axios from 'axios';
import { MeetingConfig } from '../types';
import { ShieldAlert, MonitorUp } from 'lucide-react';

interface ZoomBotProps {
  config: MeetingConfig;
  onTranscriptionComplete: (data: any) => void;
  onError: (error: string) => void;
  onStatusUpdate: (stage: 'joining' | 'recording' | 'transcribing' | 'generating', msg?: string) => void;
}

export function ZoomBot({ onTranscriptionComplete, onError, onStatusUpdate }: ZoomBotProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      // Reset any previous error states from App
      onError('');
      onStatusUpdate('joining', 'Waiting for user to select audio source...');
      
      // Requesting display media with audio allows capturing system or tab audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false
        }
      });

      // We only care about ensuring audio was actually selected
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error("You selected a screen but forgot to toggle 'Share system audio'. Please try again.");
      }

      onStatusUpdate('recording', 'Actively capturing system audio...');
      
      // IMPORTANT: Extract only the audio track so MediaRecorder doesn't try to encode video into an audio file
      const audioOnlyStream = new MediaStream([audioTracks[0]]);
      
      // Let the browser choose its default supported audio MIME type
      const mediaRecorder = new MediaRecorder(audioOnlyStream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        onStatusUpdate('transcribing', 'Meeting ended. Uploading audio to AI for transcription...');
        stream.getTracks().forEach(track => track.stop());

        // Groq API requires standard audio mime types
        const audioBlob = new Blob(audioChunksRef.current);
        const file = new File([audioBlob], 'meeting.webm', { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audio', file);


        try {
          const response = await axios.post('http://localhost:4000/api/transcribe', formData);
          onStatusUpdate('generating', 'Formatting report...');
          onTranscriptionComplete(response.data);
        } catch (err: any) {
          onError('Transcription failed: ' + (err.response?.data?.error || err.message));
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      // Listen for the user clicking "Stop sharing" on the browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

    } catch (err: any) {
      // Clear out the leftover stream safely
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      onError(err.message || 'Audio capture failed.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xl shadow-blue-50">
      <div className="mb-6 flex items-start gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
        <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-orange-900 text-sm">Zoom Sandbox Bypass Enabled</h3>
          <p className="text-orange-800 text-xs mt-1">
            Because Zoom blocks bots from joining external meetings, this tool has entered <b>Universal Capture Mode</b>.
            Join your meeting normally using your Zoom App or browser, and we will safely record the system audio.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl gap-4 text-center">
        <MonitorUp className="w-12 h-12 text-blue-500 mb-2" />
        <h2 className="text-lg font-bold text-gray-800">Ready to Record</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-4">
          Click the button below. Select your <b>Entire Screen</b> or <b>Chrome Tab</b> where the meeting is hiding, and you MUST toggle <b>Share System Audio</b> ON.
        </p>

        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
          >
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
            Start Audio Capture
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              Recording System Audio...
            </div>
            <button 
              onClick={stopRecording}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all"
            >
              End Recording & Transcribe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
