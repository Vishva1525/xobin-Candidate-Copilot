import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { VideoInterviewer, VideoInterviewerHandle } from '@/components/VideoInterviewer';
import { useVoiceCapture, getDemoAnswer } from '@/hooks/use-voice-capture';
import { xobinApplication } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { callAI } from '@/lib/ai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, ArrowRight, CheckCircle2, ChevronRight, AlertCircle, Copy, Check, Video, MessageSquare, Mic, MicOff, Square, RotateCcw, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type InterviewState = 'select' | 'questions' | 'interview' | 'summary';
type InterviewMode = 'text' | 'video';
type VideoAnswerPhase = 'listening' | 'recording' | 'confirm' | 'evaluating' | 'followup';

interface RubricBreakdown {
  relevance: number;
  star: number;
  evidence: number;
  roleAlignment: number;
  clarity: number;
}

interface StarAnalysis {
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  missing: string[];
}

interface InterviewFeedback {
  question: string;
  answer: string;
  score: number;
  rubricBreakdown: RubricBreakdown;
  strengths: string[];
  improvements: string[];
  starAnalysis: StarAnalysis;
  rewrittenAnswer: string;
  nextQuestion: string;
  confidenceScore: number;
  referencedSnippet?: string;
  interviewerResponse?: string;
}

interface InterviewHistoryEntry {
  q: string;
  a: string;
  followUp: string;
  score: number;
}

function getScoreColor(score: number) {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Strong';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Developing';
  if (score >= 30) return 'Needs Work';
  return 'Weak';
}

function RubricBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = (score / max) * 100;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-medium text-foreground">{score}/{max}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-destructive'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PrepStudio() {
  const [state, setState] = useState<InterviewState>('select');
  const selectedApp = xobinApplication;
  const [mode, setMode] = useState<InterviewMode>('text');
  const [questions, setQuestions] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [resumeText] = useLocalStorage<string>('candidateos_resume', '');

  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [speechDone, setSpeechDone] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryEntry[]>([]);

  // Voice interview state
  const [videoPhase, setVideoPhase] = useState<VideoAnswerPhase>('listening');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [showTypeFallback, setShowTypeFallback] = useState(false);
  const interviewerRef = useRef<VideoInterviewerHandle>(null);

  const voice = useVoiceCapture();
  const hasResume = !!resumeText;

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    const result = await callAI('generate_interview_questions', {
      jd: selectedApp.jobDescription,
      resumeText,
      videoInterview: mode === 'video',
    });
    setQuestions(result);
    setState('questions');
    setLoadingQuestions(false);
  };

  const handleStartMockInterview = () => {
    const allQ = [
      ...(questions?.behavioral?.slice(0, 3) || []),
      ...(questions?.technical?.slice(0, 2) || []),
    ];
    setInterviewQuestions(allQ);
    setCurrentQ(0);
    setFeedback([]);
    setAnswer('');
    setSpeechDone(false);
    setVideoPhase('listening');
    setShowTypeFallback(false);
    setInterviewHistory([]);
    setState('interview');
  };

  // Voice recording handlers
  const handleStartVoice = () => {
    voice.startRecording();
    setVideoPhase('recording');
    setShowTypeFallback(false);
  };

  const handleStopVoice = () => {
    voice.stopRecording();
    // After a short delay, move to confirm phase
    setTimeout(() => {
      const text = voice.transcript;
      if (text.trim()) {
        setEditableTranscript(text);
        setVideoPhase('confirm');
      } else {
        // No transcript captured
        setEditableTranscript('');
        setVideoPhase('confirm');
      }
    }, 500);
  };

  const handleDemoVoice = () => {
    const demoText = getDemoAnswer(interviewQuestions[currentQ]);
    setEditableTranscript(demoText);
    setVideoPhase('confirm');
  };

  const handleReRecord = () => {
    voice.reset();
    setEditableTranscript('');
    setVideoPhase('listening');
    setSpeechDone(false);
  };

  const handleSubmitVoiceAnswer = async () => {
    if (!editableTranscript.trim()) return;
    setVideoPhase('evaluating');
    setLoadingFeedback(true);

    const result = await callAI('mock_interview_feedback', {
      question: interviewQuestions[currentQ],
      answer: editableTranscript,
      jobDescription: selectedApp.jobDescription,
      resumeText,
      stage: selectedApp.stage,
    });

    const fb: InterviewFeedback = {
      question: interviewQuestions[currentQ],
      answer: editableTranscript,
      score: result.score ?? result.confidenceScore ?? 50,
      rubricBreakdown: result.rubricBreakdown ?? { relevance: 10, star: 10, evidence: 10, roleAlignment: 5, clarity: 5 },
      strengths: result.strengths ?? [],
      improvements: result.improvements ?? [],
      starAnalysis: result.starAnalysis ?? { situation: null, task: null, action: null, result: null, missing: ['Situation', 'Task', 'Action', 'Result'] },
      rewrittenAnswer: result.rewrittenAnswer ?? result.suggestedAnswer ?? '',
      nextQuestion: result.nextQuestion ?? '',
      confidenceScore: result.score ?? result.confidenceScore ?? 50,
    };
    const newFeedback = [...feedback, fb];
    setFeedback(newFeedback);
    setLoadingFeedback(false);

    if (currentQ < interviewQuestions.length - 1) {
      // Call interviewer_turn for a contextual follow-up
      const turnResult = await callAI('interviewer_turn', {
        question: interviewQuestions[currentQ],
        candidateAnswer: editableTranscript,
        application: { role: selectedApp.role, company: selectedApp.company, jobDescription: selectedApp.jobDescription },
        resume: { highlights: resumeText ? resumeText.split('\n').slice(0, 5) : [] },
        evaluation: {
          score: fb.score,
          rubricBreakdown: fb.rubricBreakdown,
          strengths: fb.strengths,
          improvements: fb.improvements,
          missingStar: fb.starAnalysis.missing,
        },
        history: interviewHistory,
      });

      const snippet = turnResult.referencedSnippet || '';
      const response = turnResult.interviewerResponse || 'Let\'s move on to the next question.';
      const followUp = turnResult.followUpQuestion || '';

      // Update feedback with snippet + response
      fb.referencedSnippet = snippet;
      fb.interviewerResponse = response;
      setFeedback([...newFeedback.slice(0, -1), fb]);

      // Track history
      setInterviewHistory(prev => [...prev, {
        q: interviewQuestions[currentQ],
        a: editableTranscript,
        followUp: response,
        score: fb.score,
      }]);

      setVideoPhase('followup');
      const spokenText = followUp ? `${response} ${followUp}` : response;
      interviewerRef.current?.speakText(spokenText);

      setTimeout(() => {
        setCurrentQ(prev => prev + 1);
        setAnswer('');
        setEditableTranscript('');
        setVideoPhase('listening');
        setSpeechDone(false);
        voice.reset();
      }, spokenText.split(/\s+/).length * 200 + 2000);
    } else {
      setInterviewHistory(prev => [...prev, {
        q: interviewQuestions[currentQ],
        a: editableTranscript,
        followUp: '',
        score: fb.score,
      }]);
      const avg = Math.round(newFeedback.reduce((s, f) => s + f.score, 0) / newFeedback.length);
      setOverallScore(avg);
      setState('summary');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoadingFeedback(true);
    const result = await callAI('mock_interview_feedback', {
      question: interviewQuestions[currentQ],
      answer,
      jobDescription: selectedApp.jobDescription,
      resumeText,
      stage: selectedApp.stage,
    });
    const fb: InterviewFeedback = {
      question: interviewQuestions[currentQ],
      answer,
      score: result.score ?? result.confidenceScore ?? 50,
      rubricBreakdown: result.rubricBreakdown ?? { relevance: 10, star: 10, evidence: 10, roleAlignment: 5, clarity: 5 },
      strengths: result.strengths ?? [],
      improvements: result.improvements ?? [],
      starAnalysis: result.starAnalysis ?? { situation: null, task: null, action: null, result: null, missing: ['Situation', 'Task', 'Action', 'Result'] },
      rewrittenAnswer: result.rewrittenAnswer ?? result.suggestedAnswer ?? '',
      nextQuestion: result.nextQuestion ?? '',
      confidenceScore: result.score ?? result.confidenceScore ?? 50,
    };
    const newFeedback = [...feedback, fb];
    setFeedback(newFeedback);
    setLoadingFeedback(false);

    if (currentQ < interviewQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer('');
      setSpeechDone(false);
    } else {
      const avg = Math.round(newFeedback.reduce((s, f) => s + f.score, 0) / newFeedback.length);
      setOverallScore(avg);
      setState('summary');
    }
  };

  const handleCopyAnswer = (idx: number) => {
    navigator.clipboard.writeText(feedback[idx].rewrittenAnswer);
    setCopiedIdx(idx);
    toast.success('Improved answer copied!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Prep Studio</h1>
            </div>

            {(state === 'select' || state === 'questions') && (
              <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
                <button
                  onClick={() => setMode('text')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    mode === 'text' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Text
                </button>
                <button
                  onClick={() => setMode('video')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    mode === 'video' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Video className="h-3.5 w-3.5" />
                  Voice Interview
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === 'video'
              ? 'Speak your answers to a simulated interviewer — just like a real video call.'
              : 'Practice with AI-powered mock interviews and get instant feedback.'}
          </p>

          {/* Resume status */}
          {!hasResume && (
            <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-warning">Upload your resume in Resume Lab for more personalized scoring.</p>
            </div>
          )}
          {hasResume && (
            <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <p className="text-sm text-success font-medium">Resume loaded — scoring uses your background</p>
            </div>
          )}

          {/* Select */}
          {state === 'select' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-card-foreground mb-3">Preparing for</h2>
                <div className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{selectedApp.role}</p>
                  <p className="text-xs text-muted-foreground">{selectedApp.company} · {selectedApp.location}</p>
                </div>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loadingQuestions}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all glow-primary-sm"
                >
                  {loadingQuestions ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate Interview Questions</>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Questions */}
          {state === 'questions' && questions && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-card-foreground mb-1">
                  {mode === 'video' ? 'Voice ' : ''}Interview Questions for {selectedApp.role}
                </h2>
                <p className="text-xs text-muted-foreground mb-4">{selectedApp.company}</p>
                <div className="space-y-4">
                  {['behavioral', 'technical', 'roleSpecific'].map(type => {
                    const items = questions[type];
                    if (!items?.length) return null;
                    const label = type === 'behavioral' ? 'Behavioral' : type === 'technical' ? 'Technical' : 'Role-Specific';
                    return (
                      <div key={type}>
                        <h3 className="text-xs font-semibold text-primary mb-2">{label} ({items.length})</h3>
                        <div className="space-y-2">
                          {items.map((q: string, i: number) => (
                            <p key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary font-medium shrink-0">{i + 1}.</span>{q}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setState('select')} className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors">Back</button>
                <button
                  onClick={handleStartMockInterview}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all glow-primary-sm"
                >
                  {mode === 'video' ? <Mic className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  Start {mode === 'video' ? 'Voice' : 'Mock'} Interview (5 questions)
                </button>
              </div>
            </motion.div>
          )}

          {/* Interview */}
          {state === 'interview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-2">
                {interviewQuestions.map((_, i) => (
                  <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all duration-300', i < currentQ ? 'bg-success' : i === currentQ ? 'bg-primary' : 'bg-secondary')} />
                ))}
              </div>

              {mode === 'video' ? (
                /* Voice Interview Layout */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Interviewer */}
                  <div>
                    <VideoInterviewer
                      ref={interviewerRef}
                      questionText={interviewQuestions[currentQ]}
                      role={selectedApp.role}
                      company={selectedApp.company}
                      onSpeechEnd={() => { setSpeechDone(true); setVideoPhase('listening'); }}
                      isActive={state === 'interview'}
                    />
                  </div>

                  {/* Right: Voice answer panel */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground">Question {currentQ + 1} of {interviewQuestions.length}</p>
                        <AnimatePresence mode="wait">
                          {videoPhase === 'listening' && speechDone && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-success font-medium flex items-center gap-1">
                              <Mic className="h-3 w-3" /> Your turn to answer
                            </motion.span>
                          )}
                          {videoPhase === 'recording' && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-destructive font-medium flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                              Recording {formatTime(voice.recordingTime)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <p className="text-sm font-medium text-foreground leading-relaxed mb-4">
                        {interviewQuestions[currentQ]}
                      </p>

                      {/* Voice capture states */}
                      <AnimatePresence mode="wait">
                        {/* Waiting / Ready to record */}
                        {(videoPhase === 'listening') && (
                          <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {voice.error && (
                              <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                                <p className="text-xs text-warning">{voice.error}</p>
                              </div>
                            )}

                            {speechDone && (
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={handleStartVoice}
                                  disabled={!speechDone}
                                  className="flex items-center justify-center gap-2 rounded-lg bg-destructive/90 hover:bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition-all disabled:opacity-50"
                                >
                                  <Mic className="h-4 w-4" />
                                  Start Recording
                                </button>

                                <div className="flex gap-2">
                                  <button
                                    onClick={handleDemoVoice}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    Simulate voice
                                  </button>
                                  <button
                                    onClick={() => { setShowTypeFallback(true); setVideoPhase('confirm'); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                                  >
                                    <Keyboard className="h-3 w-3" />
                                    Type instead
                                  </button>
                                </div>
                              </div>
                            )}

                            {!speechDone && (
                              <p className="text-xs text-muted-foreground text-center py-2">Interviewer is speaking...</p>
                            )}
                          </motion.div>
                        )}

                        {/* Recording */}
                        {videoPhase === 'recording' && (
                          <motion.div key="record" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {/* Live transcript */}
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 min-h-[60px]">
                              <p className="text-xs text-muted-foreground mb-1">Live transcript:</p>
                              <p className="text-sm text-foreground">
                                {voice.transcript}
                                {voice.interimTranscript && (
                                  <span className="text-muted-foreground/60">{voice.interimTranscript}</span>
                                )}
                                {!voice.transcript && !voice.interimTranscript && (
                                  <span className="text-muted-foreground/40 italic">Start speaking...</span>
                                )}
                              </p>
                            </div>

                            {/* Recording visualizer */}
                            <div className="flex items-center justify-center gap-0.5 py-2">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-destructive rounded-full"
                                  animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                                  transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.4, delay: i * 0.05 }}
                                />
                              ))}
                            </div>

                            <button
                              onClick={handleStopVoice}
                              className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary hover:bg-secondary/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-all"
                            >
                              <Square className="h-4 w-4" />
                              Stop Recording
                            </button>
                          </motion.div>
                        )}

                        {/* Confirm transcript */}
                        {videoPhase === 'confirm' && (
                          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1.5">
                                {showTypeFallback ? 'Type your answer:' : 'We captured this — edit if needed:'}
                              </p>
                              <textarea
                                value={editableTranscript}
                                onChange={(e) => setEditableTranscript(e.target.value)}
                                rows={4}
                                placeholder="Type or edit your answer here..."
                                className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleReRecord}
                                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Re-record
                              </button>
                              <button
                                onClick={handleSubmitVoiceAnswer}
                                disabled={!editableTranscript.trim()}
                                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Submit Answer
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Evaluating */}
                        {videoPhase === 'evaluating' && (
                          <motion.div key="eval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 animate-pulse">
                            <div className="flex items-center gap-2 justify-center py-4">
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                              <p className="text-sm text-muted-foreground">Evaluating your answer...</p>
                            </div>
                            <div className="h-2 w-3/4 rounded bg-muted mx-auto" />
                            <div className="h-2 w-1/2 rounded bg-muted mx-auto" />
                          </motion.div>
                        )}

                        {/* Follow-up */}
                        {videoPhase === 'followup' && (
                          <motion.div key="followup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4 space-y-3">
                            {feedback.length > 0 && feedback[feedback.length - 1].referencedSnippet && (
                              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                <p className="text-[10px] text-muted-foreground mb-0.5">Interviewer heard:</p>
                                <p className="text-xs font-medium text-primary italic">"{feedback[feedback.length - 1].referencedSnippet}"</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground text-center">Interviewer is responding...</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Latest feedback inline */}
                    {feedback.length > 0 && feedback.length === currentQ && videoPhase !== 'evaluating' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <FeedbackCard fb={feedback[feedback.length - 1]} index={feedback.length - 1} compact onCopy={() => handleCopyAnswer(feedback.length - 1)} copied={copiedIdx === feedback.length - 1} />
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                /* Text Interview Layout */
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {interviewQuestions.length}</p>
                    <p className="text-base font-medium text-foreground leading-relaxed mb-4">{interviewQuestions[currentQ]}</p>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={6}
                      placeholder="Type your answer here... Use the STAR method: Situation, Task, Action, Result"
                      className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[10px] text-muted-foreground">Scoring is based on STAR + role alignment.</p>
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim() || loadingFeedback}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingFeedback ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><ArrowRight className="h-4 w-4" /> Submit & Get Feedback</>}
                      </button>
                    </div>
                  </div>
                  {loadingFeedback && (
                    <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 animate-pulse">
                      <div className="h-3 w-1/3 rounded bg-muted" />
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-4/5 rounded bg-muted" />
                    </div>
                  )}
                </div>
              )}

              {/* Previous feedback (both modes) */}
              {feedback.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Previous Feedback</h3>
                  {feedback.map((f, i) => (
                    <FeedbackCard key={i} fb={f} index={i} compact onCopy={() => handleCopyAnswer(i)} copied={copiedIdx === i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Summary */}
          {state === 'summary' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <h2 className="text-lg font-bold text-foreground mb-2">{mode === 'video' ? 'Voice ' : 'Mock '}Interview Complete</h2>
                <p className="text-sm text-muted-foreground mb-6">{selectedApp.role} at {selectedApp.company}</p>
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-secondary" />
                    <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className={cn(overallScore >= 75 ? 'stroke-success' : overallScore >= 50 ? 'stroke-warning' : 'stroke-destructive')} strokeLinecap="round" strokeDasharray={`${(overallScore / 100) * 327} 327`} />
                  </svg>
                  <div className="absolute text-center">
                    <span className={cn('text-3xl font-bold', getScoreColor(overallScore))}>{overallScore}</span>
                    <p className={cn('text-xs font-medium', getScoreColor(overallScore))}>{getScoreLabel(overallScore)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>

              <div className="space-y-4">
                {feedback.map((f, i) => (
                  <FeedbackCard key={i} fb={f} index={i} onCopy={() => handleCopyAnswer(i)} copied={copiedIdx === i} />
                ))}
              </div>

              <button
                onClick={() => { setState('select'); setQuestions(null); setFeedback([]); voice.reset(); }}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
              >
                Start New Practice Session
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

function FeedbackCard({ fb, index, compact, onCopy, copied }: { fb: InterviewFeedback; index: number; compact?: boolean; onCopy: () => void; copied: boolean }) {
  const rb = fb.rubricBreakdown;
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-foreground flex-1">Q{index + 1}: {fb.question}</p>
        <div className="shrink-0 ml-3 text-right">
          <span className={cn('text-lg font-bold', getScoreColor(fb.score))}>{fb.score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
          <p className={cn('text-[10px] font-medium', getScoreColor(fb.score))}>{getScoreLabel(fb.score)}</p>
        </div>
      </div>
      {!compact && (
        <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
          <p className="italic">"{fb.answer}"</p>
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        <RubricBar label="Relevance" score={rb.relevance} max={25} />
        <RubricBar label="STAR" score={rb.star} max={25} />
        <RubricBar label="Evidence" score={rb.evidence} max={25} />
        <RubricBar label="Role Fit" score={rb.roleAlignment} max={15} />
        <RubricBar label="Clarity" score={rb.clarity} max={10} />
      </div>
      {fb.starAnalysis.missing.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <AlertCircle className="h-3 w-3 text-warning shrink-0" />
          {fb.starAnalysis.missing.map((m) => (
            <span key={m} className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">Missing {m}</span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-success mb-1">Strengths</p>
          {fb.strengths.map((s, j) => (
            <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-success shrink-0 mt-0.5" />{s}
            </p>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-warning mb-1">Improvements</p>
          {fb.improvements.map((s, j) => (
            <p key={j} className="text-xs text-muted-foreground mb-0.5">• {s}</p>
          ))}
        </div>
      </div>
      {!compact && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary">Improved Answer</p>
            <button onClick={onCopy} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-3">{fb.rewrittenAnswer}</p>
        </div>
      )}
      {fb.nextQuestion && !compact && (
        <div className="border-t border-border pt-2">
          <p className="text-[10px] text-muted-foreground"><span className="font-medium text-foreground">Likely follow-up:</span> {fb.nextQuestion}</p>
        </div>
      )}
    </div>
  );
}
