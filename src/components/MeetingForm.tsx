import { useState } from 'react';
import { MeetingConfig } from '../types';
import { Video, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onSubmit: (config: MeetingConfig) => void;
  disabled: boolean;
}

function extractMeetingData(link: string, manualPassword?: string) {
  let meetingId = '';
  // Try to extract from URL like https://zoom.us/j/1234567890
  const match = link.match(/\/j\/(\d+)/);
  if (match) {
    meetingId = match[1];
  } else {
    // If it's just a number, ignoring spaces
    const cleanNumber = link.replace(/\s+/g, '');
    if (/^\d{9,11}$/.test(cleanNumber)) meetingId = cleanNumber;
  }

  let finalPassword = manualPassword || '';
  if (!finalPassword) {
    const pwdMatch = link.match(/[?&]pwd=([^&]+)/);
    if (pwdMatch) finalPassword = pwdMatch[1];
  }

  return { meetingId, password: finalPassword };
}

export function MeetingForm({ onSubmit, disabled }: Props) {
  const [zoomLink, setZoomLink] = useState('');
  const [password, setPassword] = useState('');
  const [botName, setBotName] = useState('ZoomScribe Bot');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!zoomLink.trim()) {
      setError('Please enter a Zoom meeting link or ID');
      return;
    }

    const { meetingId, password: finalPassword } = extractMeetingData(zoomLink, password);
    if (!meetingId) {
      setError('Could not extract a valid meeting ID. Please enter a Zoom link or a numeric meeting ID.');
      return;
    }

    onSubmit({
      zoomLink: zoomLink.trim(),
      meetingId,
      meetingPassword: finalPassword,
      botDisplayName: botName || 'ZoomScribe Bot',
    });
  };

  const fillDemo = () => {
    setZoomLink('https://us02web.zoom.us/j/8549213067?pwd=Q3RsT2x5bGhVZz09');
    setPassword('abc123');
    setBotName('ZoomScribe Bot');
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="w-5 h-5" />
          Join a Meeting
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Enter your Zoom meeting details to deploy the transcription bot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Zoom Meeting Link or ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={zoomLink}
              onChange={(e) => { setZoomLink(e.target.value); setError(''); }}
              placeholder="https://zoom.us/j/1234567890?pwd=..."
              disabled={disabled}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Meeting Password <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter meeting password"
              disabled={disabled}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Bot Display Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="ZoomScribe Bot"
              disabled={disabled}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={disabled}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <ArrowRight className="w-4 h-4" />
            Deploy Bot
          </button>
          <button
            type="button"
            onClick={fillDemo}
            disabled={disabled}
            className="px-4 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Demo
          </button>
        </div>
      </form>
    </div>
  );
}
