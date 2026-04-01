import { PipelineState } from '../types';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Shield,
  Plug,
  Mic,
  Brain,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface Props {
  state: PipelineState;
}

const STAGES = [
  { key: 'validating', label: 'Validate & Extract', icon: Shield, desc: 'Extract meeting ID, validate credentials' },
  { key: 'joining', label: 'Join Meeting', icon: Plug, desc: 'SDK-based bot joins via Meeting SDK' },
  { key: 'recording', label: 'Audio Capture', icon: Mic, desc: 'Record mixed audio stream locally' },
  { key: 'transcribing', label: 'Transcribe & Diarize', icon: Brain, desc: 'OpenAI gpt-4o-transcribe-diarize' },
  { key: 'generating', label: 'Generate Report', icon: FileText, desc: 'PDF, Markdown, action items' },
];

const STAGE_ORDER = ['validating', 'joining', 'recording', 'transcribing', 'generating', 'complete'];

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function PipelineStatus({ state }: Props) {
  const currentStageIdx = STAGE_ORDER.indexOf(state.stage);

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Pipeline Status</h2>
          {state.stage !== 'idle' && state.stage !== 'complete' && state.stage !== 'error' && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Processing
            </span>
          )}
          {state.stage === 'complete' && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </span>
          )}
        </div>

        {/* Progress bar */}
        {state.stage !== 'idle' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{state.message}</span>
              <span className="font-mono">{state.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-1">
        {STAGES.map((stage, idx) => {
          const stageIdx = STAGE_ORDER.indexOf(stage.key);
          const isActive = state.stage === stage.key;
          const isComplete = currentStageIdx > stageIdx;
          const isPending = currentStageIdx < stageIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative">
              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`absolute left-5 top-12 w-0.5 h-6 ${
                    isComplete ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}

              <div
                className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200'
                    : isComplete
                    ? 'bg-green-50/50'
                    : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : isComplete
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isPending ? (
                    <Circle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${
                      isActive ? 'text-blue-700' : isComplete ? 'text-green-700' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                    {stage.desc}
                  </p>
                </div>

                {/* Audio level indicator for recording stage */}
                {isActive && stage.key === 'recording' && state.audioLevel !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-end gap-0.5 h-6">
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-75 ${
                            state.audioLevel! >= threshold
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                          style={{
                            height: `${(i + 1) * 4 + 4}px`,
                          }}
                        />
                      ))}
                    </div>
                    {state.elapsedTime !== undefined && (
                      <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                        {formatElapsed(state.elapsedTime)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state.stage === 'error' && (
        <div className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Pipeline Error</p>
            <p className="text-red-600 text-xs mt-1">{state.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
