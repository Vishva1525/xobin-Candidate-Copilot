import { useState, useCallback, useRef, useEffect } from 'react';

export type VoiceState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error';

// Check if browser supports SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function useVoiceCapture() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setRecordingTime(0);

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please type your answer instead.');
      setVoiceState('error');
      return;
    }

    setVoiceState('requesting');

    try {
      // Request mic permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Release immediately, SpeechRecognition handles its own

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('recording');
        timerRef.current = setInterval(() => {
          setRecordingTime(t => t + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        finalTranscriptRef.current = final.trim();
        setTranscript(final.trim());
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone access or type your answer.');
        } else if (event.error === 'no-speech') {
          // Ignore — just silence
          return;
        } else {
          setError(`Speech recognition error: ${event.error}. You can type your answer instead.`);
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setVoiceState('error');
      };

      recognition.onend = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        // Only set processing if we were recording (not if error)
        setVoiceState(prev => prev === 'recording' ? 'processing' : prev);
        // Ensure final transcript is captured
        if (finalTranscriptRef.current) {
          setTranscript(finalTranscriptRef.current);
        }
        setInterimTranscript('');
        // Short delay then go to idle (transcript confirmation handled by parent)
        setTimeout(() => {
          setVoiceState(prev => prev === 'processing' ? 'idle' : prev);
        }, 300);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone access in your browser settings, or type your answer.');
      } else {
        setError('Could not access microphone. Please type your answer instead.');
      }
      setVoiceState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setVoiceState('idle');
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);
    setError(null);
    finalTranscriptRef.current = '';
  }, [stopRecording]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    voiceState,
    transcript,
    interimTranscript,
    recordingTime,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
    setTranscript,
  };
}

// Demo mode: simulate a spoken answer based on question
const demoAnswers: Record<string, string> = {
  'difficult technical decision': 'At Figma, I had to decide between rewriting our rendering engine from scratch or incrementally optimizing the existing one. We had incomplete performance data, so I proposed a 2-week spike to profile the bottlenecks. Based on the results, I chose incremental optimization which improved frame rates by 28% without the risk of a full rewrite.',
  'disagreed': 'I disagreed with our design lead about implementing a custom tooltip system versus using the browser native one. I scheduled a meeting, presented data on accessibility concerns and maintenance cost, and we reached a compromise using a lightweight custom solution with proper ARIA attributes.',
  'mentoring': 'I mentored a junior engineer at Vercel by creating a structured 90-day growth plan. We had weekly 1-on-1s where I reviewed their code, assigned progressively complex tasks, and helped them present at team meetings. Within 6 months, they were independently shipping features and mentoring interns themselves.',
  'failed': 'Our team attempted to ship a new dashboard in 4 weeks, but we underestimated the complexity of real-time data syncing. The project slipped by 3 weeks. I learned to break projects into smaller milestones with clear validation checkpoints, which I applied to every subsequent project.',
  'breaking down': 'When tasked with rebuilding our deployment pipeline, I started by mapping all stakeholders and their requirements. I created a phased roadmap with 2-week sprints, each delivering a working increment. This approach helped us ship the MVP in 6 weeks while maintaining team morale.',
  'component library': 'I would start with a design token layer for colors, spacing, and typography. Then build primitive components like Button and Input with compound component patterns. Each component would follow WAI-ARIA guidelines, support theming via CSS custom properties, and include comprehensive Storybook documentation.',
  'optimize': 'I would start by profiling with React DevTools to identify unnecessary re-renders. Then check for missing memoization, large bundle sizes via webpack-bundle-analyzer, and implement code splitting with React.lazy. I would also look at virtualization for long lists and optimize images.',
  'default': 'In my previous role, I was responsible for improving our frontend performance. I analyzed the codebase, identified key bottlenecks in our rendering pipeline, and implemented solutions that improved load times by 40%. The team adopted my optimization patterns as best practices.',
};

export function getDemoAnswer(question: string): string {
  const qLower = question.toLowerCase();
  for (const [key, answer] of Object.entries(demoAnswers)) {
    if (key === 'default') continue;
    if (qLower.includes(key)) return answer;
  }
  return demoAnswers.default;
}
