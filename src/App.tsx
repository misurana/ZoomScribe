import { useState } from 'react';
import { MeetingForm } from './components/MeetingForm';
import { PipelineStatus } from './components/PipelineStatus';
import { TranscriptViewer } from './components/TranscriptViewer';
import { ReportView } from './components/ReportView';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { ApiReference } from './components/ApiReference';
import { ZoomBot } from './components/ZoomBot';
import { usePipeline } from './usePipeline';
import { MeetingConfig } from './types';
import {
  Mic,
  RotateCcw,
  ScrollText,
  BarChart3,
  Code2,
  LayoutDashboard,
  Zap,
} from 'lucide-react';

type Tab = 'dashboard' | 'transcript' | 'report' | 'architecture' | 'api';

export default function App() {
  const { state, startPipeline, updateStage, completePipeline, reset } = usePipeline();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleSubmit = (config: MeetingConfig) => {
    setActiveTab('dashboard');
    startPipeline(config);
  };

  const handleReset = () => {
    reset();
    setActiveTab('dashboard');
  };

  const isRunning = !['idle', 'complete', 'error'].includes(state.stage);
  const isComplete = state.stage === 'complete';

  const tabs: { key: Tab; label: string; icon: typeof Mic; enabled: boolean }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
    { key: 'transcript', label: 'Transcript', icon: ScrollText, enabled: isComplete },
    { key: 'report', label: 'Report', icon: BarChart3, enabled: isComplete },
    { key: 'architecture', label: 'Architecture', icon: Zap, enabled: true },
    { key: 'api', label: 'API Reference', icon: Code2, enabled: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">ZoomScribe</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5 font-medium tracking-wide uppercase">
                  AI Meeting Transcription
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isComplete && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Session
                </button>
              )}
              {state.stage !== 'idle' && !isComplete && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-blue-600 font-medium">Pipeline Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => tab.enabled && setActiveTab(tab.key)}
                disabled={!tab.enabled}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : tab.enabled
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {!tab.enabled && (
                  <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                    locked
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              <MeetingForm onSubmit={handleSubmit} disabled={isRunning} />

              {/* Quick info cards */}
              {state.stage !== 'idle' && !isComplete ? (
                <ZoomBot 
                  config={state.meetingConfig!} 
                  onTranscriptionComplete={completePipeline} 
                  onError={(err) => updateStage('error', err)} 
                  onStatusUpdate={updateStage} 
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-2xl mb-1">🤖</div>
                    <p className="font-semibold text-sm text-gray-800">Zoom Web SDK</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Client-side meeting embed
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-2xl mb-1">🎙️</div>
                    <p className="font-semibold text-sm text-gray-800">Tab Capture</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Audio recording via browser
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-2xl mb-1">🧠</div>
                    <p className="font-semibold text-sm text-gray-800">Groq Whisper</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lightning fast transcription
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="text-2xl mb-1">📄</div>
                    <p className="font-semibold text-sm text-gray-800">PDF + MD Export</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Report generation
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Pipeline Status */}
            <div className="lg:col-span-3">
              <PipelineStatus state={state} />

              {/* Meeting details when running or complete */}
              {state.meetingConfig && (
                <div className="mt-6 bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">Session Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Meeting ID</p>
                      <p className="font-mono font-semibold text-gray-700">
                        {state.meetingConfig.meetingId}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Bot Name</p>
                      <p className="font-semibold text-gray-700">
                        {state.meetingConfig.botDisplayName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Password</p>
                      <p className="font-mono text-gray-700">
                        {state.meetingConfig.meetingPassword || '(none)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Status</p>
                      <p className="font-semibold capitalize text-gray-700">
                        {state.stage === 'complete' ? (
                          <span className="text-green-600">✓ Complete</span>
                        ) : state.stage === 'error' ? (
                          <span className="text-red-600">✗ Error</span>
                        ) : (
                          <span className="text-blue-600">{state.stage}...</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA when complete */}
              {isComplete && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <p className="font-bold text-green-800 mb-2">
                    ✅ Transcription Complete!
                  </p>
                  <p className="text-sm text-green-700 mb-4">
                    Your meeting has been transcribed and diarized with {state.report?.segments.length} segments
                    from {state.report?.participants.length} speakers.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    >
                      <ScrollText className="w-4 h-4" />
                      View Transcript
                    </button>
                    <button
                      onClick={() => setActiveTab('report')}
                      className="bg-white hover:bg-gray-50 text-green-700 border border-green-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transcript' && state.report && (
          <TranscriptViewer
            segments={state.report.segments}
            participants={state.report.participants}
          />
        )}

        {activeTab === 'report' && state.report && (
          <ReportView report={state.report} />
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <ArchitectureDiagram />

            {/* Data flow explanation */}
            <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Pipeline Data Flow</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">1</span>
                  <div>
                    <p className="font-semibold text-gray-800">User submits Zoom link</p>
                    <p>The frontend form collects the Zoom meeting URL, optional password, and desired bot display name. The meeting ID is extracted from the URL pattern <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">/j/{'{'}<span>meetingId</span>{'}'}</code>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">2</span>
                  <div>
                    <p className="font-semibold text-gray-800">Backend creates join session</p>
                    <p>The server validates the meeting ID, generates a Meeting SDK signature using the SDK key/secret, and spawns a bot worker process to join the meeting.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center font-bold text-xs">3</span>
                  <div>
                    <p className="font-semibold text-gray-800">Bot joins and captures audio</p>
                    <p>The SDK-based bot joins the Zoom meeting as a participant. It captures the mixed audio stream (all participants' audio combined) and records it locally as a WAV file.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">4</span>
                  <div>
                    <p className="font-semibold text-gray-800">OpenAI transcription with diarization</p>
                    <p>After the meeting ends, the audio file is sent to OpenAI's transcription API using the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">gpt-4o-transcribe</code> model with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">response_format: "diarized_json"</code>. The response includes speaker labels, start/end timestamps, and transcribed text for each segment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center font-bold text-xs">5</span>
                  <div>
                    <p className="font-semibold text-gray-800">Report generation and export</p>
                    <p>The diarized transcript is formatted into a comprehensive report with meeting summary, action items, and key topics. The report can be exported as PDF (using jsPDF with auto-tables) or Markdown for easy sharing and documentation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && <ApiReference />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mic className="w-4 h-4" />
            <span className="font-semibold text-gray-700">ZoomScribe</span>
            <span>— AI-powered meeting transcription & diarization</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Zoom Meeting SDK</span>
            <span>•</span>
            <span>OpenAI gpt-4o-transcribe</span>
            <span>•</span>
            <span>diarized_json</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
