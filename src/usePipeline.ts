import { useState, useCallback } from 'react';
import { PipelineState, MeetingConfig } from './types';

export function usePipeline() {
  const [state, setState] = useState<PipelineState>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to start',
  });

  const startPipeline = useCallback(
    (config: MeetingConfig) => {
      setState({
        stage: 'validating',
        progress: 10,
        message: 'Starting Zoom client...',
        meetingConfig: config,
      });
    },
    []
  );

  const updateStage = useCallback((stage: PipelineState['stage'], msg?: string, progress?: number) => {
    setState((prev) => {
      let calcProgress = progress ?? prev.progress;
      if (progress === undefined) {
        if (stage === 'joining') calcProgress = 25;
        if (stage === 'recording') calcProgress = 50;
        if (stage === 'transcribing') calcProgress = 75;
        if (stage === 'generating') calcProgress = 90;
      }
      return {
        ...prev,
        stage,
        message: msg || prev.message,
        progress: calcProgress,
      };
    });
  }, []);

  const completePipeline = useCallback((reportData: any) => {
    setState((prev) => ({
      ...prev,
      stage: 'complete',
      progress: 100,
      message: 'Report generated successfully!',
      report: reportData,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      stage: 'idle',
      progress: 0,
      message: 'Ready to start',
    });
  }, []);

  return { state, startPipeline, updateStage, completePipeline, reset };
}
