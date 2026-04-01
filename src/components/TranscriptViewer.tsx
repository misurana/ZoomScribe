import { useState } from 'react';
import { TranscriptSegment } from '../types';
import { Search, Clock, User } from 'lucide-react';

interface Props {
  segments: TranscriptSegment[];
  participants: string[];
}

const SPEAKER_COLORS: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  'Sarah Chen': { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
  'Marcus Rivera': { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', dot: 'bg-sky-500' },
  'Priya Patel': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  'James Okonkwo': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', dot: 'bg-gray-500' };

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function TranscriptViewer({ segments, participants }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);

  const filtered = segments.filter((seg) => {
    const matchesSearch = !searchQuery || seg.text.toLowerCase().includes(searchQuery.toLowerCase()) || seg.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker = !selectedSpeaker || seg.speaker === selectedSpeaker;
    return matchesSearch && matchesSpeaker;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Diarized Transcript</h2>

        {/* Speaker filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedSpeaker(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !selectedSpeaker
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({segments.length})
          </button>
          {participants.map((p) => {
            const colors = SPEAKER_COLORS[p] || DEFAULT_COLOR;
            const count = segments.filter((s) => s.speaker === p).length;
            return (
              <button
                key={p}
                onClick={() => setSelectedSpeaker(selectedSpeaker === p ? null : p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedSpeaker === p
                    ? `${colors.bg} ${colors.text} ring-2 ${colors.ring}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                {p} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No matching segments found
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((seg, idx) => {
              const colors = SPEAKER_COLORS[seg.speaker] || DEFAULT_COLOR;
              return (
                <div
                  key={idx}
                  className="px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full ${colors.dot} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {getInitials(seg.speaker)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${colors.text}`}>
                          {seg.speaker}
                        </span>
                        <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(seg.start)} — {formatTimestamp(seg.end)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {searchQuery
                          ? highlightText(seg.text, searchQuery)
                          : seg.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {participants.length} speakers
        </span>
        <span>
          {filtered.length} of {segments.length} segments
        </span>
      </div>
    </div>
  );
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
