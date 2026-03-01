import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoInterviewerProps {
  questionText: string;
  role: string;
  company: string;
  onSpeechEnd?: () => void;
  isActive: boolean;
}

export interface VideoInterviewerHandle {
  speakText: (text: string) => void;
  isSpeaking: boolean;
}

export const VideoInterviewer = forwardRef<VideoInterviewerHandle, VideoInterviewerProps>(
  ({ questionText, role, company, onSpeechEnd, isActive }, ref) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);
    const [subtitleWords, setSubtitleWords] = useState<string[]>([]);
    const [currentWordIdx, setCurrentWordIdx] = useState(-1);
    const [statusLabel, setStatusLabel] = useState<string | null>(null);
    const mouthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopSpeech = useCallback(() => {
      window.speechSynthesis.cancel();
      if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
      setIsSpeaking(false);
      setMouthOpen(0);
      setStatusLabel(null);
    }, []);

    const doSpeak = useCallback((text: string, onEnd?: () => void) => {
      stopSpeech();
      setIsLoading(true);

      const words = text.split(/\s+/);
      setSubtitleWords(words);
      setCurrentWordIdx(-1);

      setTimeout(() => {
        setIsLoading(false);
        setIsSpeaking(true);
        setHasSpoken(true);
        setStatusLabel('Speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
          v.name.includes('Samantha') || v.name.includes('Google UK English Female') ||
          v.name.includes('Microsoft Zira') || v.name.includes('Karen') ||
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferred) utterance.voice = preferred;

        let wordCounter = 0;
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            setCurrentWordIdx(wordCounter);
            wordCounter++;
          }
        };

        mouthIntervalRef.current = setInterval(() => {
          setMouthOpen(Math.random() * 0.7 + 0.3);
        }, 100);

        utterance.onend = () => {
          if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
          setIsSpeaking(false);
          setMouthOpen(0);
          setCurrentWordIdx(words.length);
          setStatusLabel(null);
          onEnd?.();
        };

        utterance.onerror = () => {
          if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
          setIsSpeaking(false);
          setMouthOpen(0);
          setStatusLabel(null);
          onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      }, 400);
    }, [stopSpeech]);

    const speak = useCallback(() => {
      doSpeak(questionText, onSpeechEnd);
    }, [questionText, onSpeechEnd, doSpeak]);

    // Expose speakText to parent
    useImperativeHandle(ref, () => ({
      speakText: (text: string) => doSpeak(text),
      isSpeaking,
    }), [doSpeak, isSpeaking]);

    // Speak question when it changes
    useEffect(() => {
      if (isActive && questionText) {
        const trySpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            speak();
          } else {
            window.speechSynthesis.onvoiceschanged = () => speak();
          }
        };
        trySpeak();
      }
      return () => stopSpeech();
    }, [questionText, isActive]);

    useEffect(() => {
      return () => stopSpeech();
    }, [stopSpeech]);

    // Allow parent to set status label
    const setStatus = useCallback((label: string | null) => {
      setStatusLabel(label);
    }, []);

    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Video area */}
        <div className="relative aspect-video bg-gradient-to-br from-[hsl(var(--primary)/0.08)] via-card to-[hsl(var(--accent)/0.05)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />

          <AvatarFigure mouthOpen={mouthOpen} isSpeaking={isSpeaking} />

          {/* Status indicators */}
          <AnimatePresence>
            {(isSpeaking || statusLabel) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={cn(
                  'absolute top-4 right-4 flex items-center gap-2 rounded-full backdrop-blur-sm px-3 py-1.5',
                  statusLabel === 'Listening' ? 'bg-destructive/15' : 'bg-primary/15'
                )}
              >
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className={cn('w-0.5 rounded-full', statusLabel === 'Listening' ? 'bg-destructive' : 'bg-primary')}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className={cn('text-[10px] font-medium', statusLabel === 'Listening' ? 'text-destructive' : 'text-primary')}>
                  {statusLabel || 'Speaking'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Name badge */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Alex Morgan</p>
            <p className="text-[10px] text-muted-foreground">Hiring Manager — {role} at {company}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasSpoken && (
              <button
                onClick={speak}
                disabled={isSpeaking}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" />
                Replay
              </button>
            )}
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1',
              isSpeaking ? 'bg-primary/10' : 'bg-secondary'
            )}>
              <Volume2 className={cn('h-3 w-3', isSpeaking ? 'text-primary' : 'text-muted-foreground')} />
            </div>
          </div>
        </div>

        {/* Subtitles */}
        <div className="px-4 py-3 border-t border-border min-h-[52px]">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subtitleWords.map((word, i) => (
              <span
                key={i}
                className={cn(
                  'transition-colors duration-200',
                  i <= currentWordIdx ? 'text-foreground font-medium' : 'text-muted-foreground/50'
                )}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>
    );
  }
);

VideoInterviewer.displayName = 'VideoInterviewer';

function AvatarFigure({ mouthOpen, isSpeaking }: { mouthOpen: number; isSpeaking: boolean }) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const mouthHeight = 2 + mouthOpen * 10;
  const mouthWidth = 16 + mouthOpen * 6;
  const mouthY = 72 + (1 - mouthOpen) * 2;

  return (
    <motion.div
      className="relative"
      animate={{ y: isSpeaking ? [0, -2, 0] : 0 }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <svg width="160" height="180" viewBox="0 0 120 140" fill="none">
        <ellipse cx="60" cy="58" rx="38" ry="42" className="fill-[hsl(var(--muted))]" />
        <path d="M22 48 C22 22 98 22 98 48 C98 36 90 18 60 18 C30 18 22 36 22 48Z" className="fill-[hsl(var(--foreground)/0.7)]" />
        <path d="M38 42 Q44 38 50 42" strokeWidth="2" strokeLinecap="round" className="stroke-[hsl(var(--foreground)/0.5)]" fill="none" />
        <path d="M70 42 Q76 38 82 42" strokeWidth="2" strokeLinecap="round" className="stroke-[hsl(var(--foreground)/0.5)]" fill="none" />
        <ellipse cx="44" cy="50" rx="5" ry={blinking ? 0.5 : 5} className="fill-[hsl(var(--foreground)/0.75)]">
          {!blinking && <animate attributeName="ry" values="5;5;5;0.5;5" dur="4s" repeatCount="indefinite" begin="2s" />}
        </ellipse>
        <ellipse cx="76" cy="50" rx="5" ry={blinking ? 0.5 : 5} className="fill-[hsl(var(--foreground)/0.75)]">
          {!blinking && <animate attributeName="ry" values="5;5;5;0.5;5" dur="4s" repeatCount="indefinite" begin="2s" />}
        </ellipse>
        <circle cx="46" cy="48" r="1.5" className="fill-[hsl(var(--background))]" />
        <circle cx="78" cy="48" r="1.5" className="fill-[hsl(var(--background))]" />
        <path d="M58 55 Q60 62 62 55" strokeWidth="1.5" strokeLinecap="round" className="stroke-[hsl(var(--foreground)/0.2)]" fill="none" />
        <motion.ellipse
          cx="60" cy={mouthY} rx={mouthWidth / 2} ry={mouthHeight / 2}
          className="fill-[hsl(var(--foreground)/0.6)]"
          animate={{ ry: mouthHeight / 2, rx: mouthWidth / 2, cy: mouthY }}
          transition={{ duration: 0.08 }}
        />
        {!isSpeaking && (
          <path d="M50 70 Q60 78 70 70" strokeWidth="2" strokeLinecap="round" className="stroke-[hsl(var(--foreground)/0.4)]" fill="none" />
        )}
        <rect x="50" y="96" width="20" height="12" rx="4" className="fill-[hsl(var(--muted))]" />
        <path d="M20 140 Q20 108 48 108 L72 108 Q100 108 100 140Z" className="fill-[hsl(var(--primary)/0.3)]" />
        <path d="M48 108 L56 120 L60 108" strokeWidth="1.5" className="stroke-[hsl(var(--background)/0.5)]" fill="none" />
        <path d="M72 108 L64 120 L60 108" strokeWidth="1.5" className="stroke-[hsl(var(--background)/0.5)]" fill="none" />
      </svg>
    </motion.div>
  );
}
