import { TranscriptSegment, MeetingReport } from './types';

export const MOCK_SEGMENTS: TranscriptSegment[] = [
  { speaker: 'Sarah Chen', start: 0.0, end: 8.2, text: "Good morning everyone, thanks for joining today's product sync. Let's start with the Q3 roadmap update." },
  { speaker: 'Marcus Rivera', start: 8.5, end: 18.1, text: "Thanks Sarah. So we've completed the authentication overhaul ahead of schedule. The new OAuth 2.0 flow is live in staging and we're seeing a 40% reduction in login failures." },
  { speaker: 'Sarah Chen', start: 18.4, end: 22.7, text: "That's excellent progress. What about the mobile SDK integration?" },
  { speaker: 'Priya Patel', start: 23.0, end: 35.5, text: "The mobile SDK is about 80% complete. We hit a snag with the iOS WebSocket implementation — there's a memory leak when handling concurrent audio streams. I've filed a PR with a fix that James is reviewing." },
  { speaker: 'James Okonkwo', start: 36.0, end: 48.2, text: "Yeah, I looked at Priya's fix this morning. The approach is solid — she's using a weak reference pattern for the audio buffer callbacks. I should have the review done by end of day. One thing I'd flag is we should add stress tests for that path." },
  { speaker: 'Sarah Chen', start: 48.5, end: 53.1, text: "Good call on the stress tests. Priya, can you add those to the test suite by Friday?" },
  { speaker: 'Priya Patel', start: 53.4, end: 57.8, text: "Absolutely, I'll create a test plan and share it with the team tomorrow." },
  { speaker: 'Marcus Rivera', start: 58.2, end: 72.0, text: "On the API side, I want to flag that we're approaching our rate limit thresholds on the transcription endpoint. Current peak is about 850 requests per minute. We should discuss scaling strategy before launch." },
  { speaker: 'Sarah Chen', start: 72.3, end: 78.9, text: "That's a critical point. What are our options? Can we do horizontal scaling or do we need to rearchitect?" },
  { speaker: 'Marcus Rivera', start: 79.2, end: 93.5, text: "Both, actually. Short term, we can add more pods behind the load balancer — that gets us to about 2000 RPM. Long term, I'd recommend moving to an event-driven architecture with a message queue for the transcription jobs." },
  { speaker: 'James Okonkwo', start: 94.0, end: 105.3, text: "I agree with Marcus on the event-driven approach. We could use a Redis-backed queue with worker pools. I prototyped something similar last quarter for the notification service and it handled 10x our current load without issues." },
  { speaker: 'Sarah Chen', start: 105.8, end: 112.4, text: "Let's schedule a deep-dive on the architecture next week. Marcus, can you prepare a comparison doc?" },
  { speaker: 'Marcus Rivera', start: 112.8, end: 116.2, text: "Will do. I'll have it ready by Monday for review." },
  { speaker: 'Priya Patel', start: 116.5, end: 128.0, text: "One more thing — the design team sent over the updated UI mockups for the dashboard. There are some significant changes to the analytics view. Should we prioritize implementing those this sprint or push to next?" },
  { speaker: 'Sarah Chen', start: 128.3, end: 138.7, text: "Let's review the mockups in our design review Thursday and decide then. I don't want to commit without understanding the scope. Anything else before we wrap up?" },
  { speaker: 'James Okonkwo', start: 139.0, end: 148.5, text: "Just a reminder that the security audit is scheduled for next Wednesday. I'll need everyone to have their code documentation updated by Tuesday. Especially the API authentication modules." },
  { speaker: 'Sarah Chen', start: 148.8, end: 156.0, text: "Great reminder. Everyone please make that a priority. Alright, good meeting everyone. Let's stay on track and I'll see you all Thursday." },
  { speaker: 'Marcus Rivera', start: 156.3, end: 157.5, text: "Thanks Sarah, talk soon." },
  { speaker: 'Priya Patel', start: 157.8, end: 159.0, text: "Thanks everyone, bye!" },
  { speaker: 'James Okonkwo', start: 159.3, end: 160.5, text: "See you Thursday." },
];

export function generateMockReport(meetingId: string): MeetingReport {
  return {
    meetingId,
    title: 'Q3 Product Sync — Engineering Update',
    date: new Date().toISOString(),
    duration: '2m 41s',
    participants: ['Sarah Chen', 'Marcus Rivera', 'Priya Patel', 'James Okonkwo'],
    segments: MOCK_SEGMENTS,
    summary:
      'The team discussed Q3 roadmap progress including the completed OAuth 2.0 authentication overhaul (40% reduction in login failures), mobile SDK integration (80% complete with an iOS WebSocket memory leak being resolved), API rate limiting concerns on the transcription endpoint, and upcoming UI dashboard redesign. Key architectural decisions around scaling strategy (horizontal scaling short-term, event-driven architecture long-term) were identified for further discussion.',
    actionItems: [
      'Priya: Add stress tests for iOS WebSocket audio buffer fix by Friday',
      'Priya: Share test plan with team by tomorrow',
      'Marcus: Prepare architecture comparison doc (horizontal vs event-driven) by Monday',
      'All: Review updated UI mockups before Thursday design review',
      'All: Update code documentation by Tuesday for Wednesday security audit',
      'James: Complete PR review of Priya\'s WebSocket fix by end of day',
    ],
    keyTopics: [
      'OAuth 2.0 Authentication Overhaul — Complete',
      'Mobile SDK Integration — 80% complete, iOS memory leak fix in review',
      'API Rate Limiting — Approaching 850 RPM threshold, scaling needed',
      'Architecture Discussion — Horizontal scaling vs event-driven with Redis queue',
      'Dashboard UI Redesign — Mockups received, scope review Thursday',
      'Security Audit — Scheduled next Wednesday',
    ],
  };
}
