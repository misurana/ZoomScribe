export interface MeetingConfig {
  zoomLink: string;
  meetingId: string;
  meetingPassword: string;
  botDisplayName: string;
}

export interface TranscriptSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface MeetingReport {
  meetingId: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  segments: TranscriptSegment[];
  summary: string;
  actionItems: string[];
  keyTopics: string[];
}

export type PipelineStage =
  | 'idle'
  | 'validating'
  | 'joining'
  | 'recording'
  | 'transcribing'
  | 'generating'
  | 'complete'
  | 'error';

export interface PipelineState {
  stage: PipelineStage;
  progress: number;
  message: string;
  error?: string;
  meetingConfig?: MeetingConfig;
  report?: MeetingReport;
  audioLevel?: number;
  elapsedTime?: number;
}
