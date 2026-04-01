import { MeetingReport } from '../types';
import { exportToPDF, exportToMarkdown } from '../exportUtils';
import {
  Download,
  FileDown,
  Users,
  Clock,
  Hash,
  Lightbulb,
  CheckSquare,
  Target,
  CalendarDays,
} from 'lucide-react';

interface Props {
  report: MeetingReport;
}

export function ReportView({ report }: Props) {
  const dateStr = new Date(report.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date(report.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Meeting Report</p>
            <h2 className="text-2xl font-bold">{report.title}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportToPDF(report)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => exportToMarkdown(report)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Markdown
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-blue-200 text-xs mb-1">
              <CalendarDays className="w-3 h-3" />
              Date
            </div>
            <p className="font-semibold text-sm">{dateStr}</p>
            <p className="text-blue-200 text-xs">{timeStr}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-blue-200 text-xs mb-1">
              <Clock className="w-3 h-3" />
              Duration
            </div>
            <p className="font-semibold text-sm">{report.duration}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-blue-200 text-xs mb-1">
              <Users className="w-3 h-3" />
              Participants
            </div>
            <p className="font-semibold text-sm">{report.participants.length} people</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-blue-200 text-xs mb-1">
              <Hash className="w-3 h-3" />
              Segments
            </div>
            <p className="font-semibold text-sm">{report.segments.length} total</p>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          Participants
        </h3>
        <div className="flex flex-wrap gap-2">
          {report.participants.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                {p.split(' ').map(n => n[0]).join('')}
              </span>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Meeting Summary
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm">{report.summary}</p>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-green-500" />
          Action Items
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {report.actionItems.length}
          </span>
        </h3>
        <div className="space-y-2">
          {report.actionItems.map((item, idx) => {
            const [assignee, ...rest] = item.split(':');
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100"
              >
                <div className="w-5 h-5 mt-0.5 border-2 border-green-400 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-green-500">{idx + 1}</span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-green-700">{assignee}:</span>
                  {rest.join(':')}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Topics */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-indigo-500" />
          Key Topics Discussed
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.keyTopics.map((topic, idx) => {
            const [title, ...desc] = topic.split('—');
            return (
              <div
                key={idx}
                className="p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100"
              >
                <p className="font-semibold text-sm text-gray-800">{title.trim()}</p>
                {desc.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{desc.join('—').trim()}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
