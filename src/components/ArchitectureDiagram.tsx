import {
  Server,
  Bot,
  Mic,
  Brain,
  FileText,
  ArrowRight,
  Globe,
  Monitor,
} from 'lucide-react';

const steps = [
  {
    icon: Globe,
    label: 'User Input',
    desc: 'Zoom link + password + bot name',
    color: 'from-gray-500 to-gray-600',
    detail: 'Web form submission',
  },
  {
    icon: Server,
    label: 'Backend App',
    desc: 'Extract meeting ID, create session',
    color: 'from-blue-500 to-blue-600',
    detail: 'Node.js / API server',
  },
  {
    icon: Bot,
    label: 'Zoom Bot Worker',
    desc: 'Join via Meeting SDK',
    color: 'from-indigo-500 to-indigo-600',
    detail: 'SDK-based bot process',
  },
  {
    icon: Mic,
    label: 'Audio Capture',
    desc: 'Record mixed audio stream',
    color: 'from-violet-500 to-violet-600',
    detail: 'Local WAV/PCM recording',
  },
  {
    icon: Brain,
    label: 'Transcribe + Diarize',
    desc: 'gpt-4o-transcribe-diarize',
    color: 'from-purple-500 to-purple-600',
    detail: 'OpenAI API → diarized_json',
  },
  {
    icon: FileText,
    label: 'Report Generation',
    desc: 'PDF, Markdown, action items',
    color: 'from-pink-500 to-pink-600',
    detail: 'Document export',
  },
];

export function ArchitectureDiagram() {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-500" />
          System Architecture
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          End-to-end pipeline from Zoom link to generated report
        </p>
      </div>

      {/* Desktop: horizontal flow */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg mb-3`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-xs text-gray-800">{step.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight max-w-[100px]">
                  {step.desc}
                </p>
                <span className="mt-1.5 text-[9px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {step.detail}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0 -mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical flow */}
      <div className="lg:hidden p-6">
        <div className="space-y-1">
          {steps.map((step, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                  <span className="text-[10px] font-mono text-gray-400">{step.detail}</span>
                </div>
                <span className="text-xs font-bold text-gray-300">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="ml-6 h-4 border-l-2 border-dashed border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech badges */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
        {[
          'Zoom Meeting SDK',
          'OpenAI API',
          'gpt-4o-transcribe-diarize',
          'diarized_json',
          'WebSocket',
          'OAuth 2.0',
          'jsPDF',
          'Node.js',
        ].map((tech) => (
          <span
            key={tech}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-mono text-gray-600"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
