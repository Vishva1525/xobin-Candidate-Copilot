import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { mockApplications } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { callAI } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Loader2, ArrowRight, CheckCircle2, ChevronRight, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type InterviewState = 'select' | 'questions' | 'interview' | 'summary';

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

export default function PrepStudio() {
  const [selectedAppId, setSelectedAppId] = useState(mockApplications[0].id);
  const [state, setState] = useState<InterviewState>('select');
  const [questions, setQuestions] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [resumeText] = useLocalStorage<string>('candidateos_resume', '');

  // Mock interview state
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const selectedApp = mockApplications.find(a => a.id === selectedAppId)!;
  const hasResume = !!resumeText;

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    const result = await callAI('generate_interview_questions', {
      jd: selectedApp.jobDescription,
      resumeText,
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
    setState('interview');
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
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Prep Studio</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Practice with AI-powered mock interviews and get instant feedback.</p>

          {/* Resume status indicator */}
          {!hasResume && (
            <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-warning">Upload your resume in Resume Lab for more personalized scoring and feedback.</p>
            </div>
          )}
          {hasResume && (
            <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <p className="text-sm text-success font-medium">Resume loaded — scoring uses your background for better feedback</p>
            </div>
          )}

          {/* Application selector */}
          {state === 'select' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-card-foreground mb-3">Choose application to prepare for</h2>
                <div className="space-y-2">
                  {mockApplications.map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all',
                        selectedAppId === app.id
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-card hover:border-border/80'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{app.role}</p>
                        <p className="text-xs text-muted-foreground">{app.company} · {app.location}</p>
                      </div>
                      <ChevronRight className={cn('h-4 w-4', selectedAppId === app.id ? 'text-primary' : 'text-muted-foreground')} />
                    </button>
                  ))}
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

          {/* Questions view */}
          {state === 'questions' && questions && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-card-foreground mb-1">
                  Interview Questions for {selectedApp.role}
                </h2>
                <p className="text-xs text-muted-foreground mb-4">{selectedApp.company}</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-primary mb-2">Behavioral ({questions.behavioral.length})</h3>
                    <div className="space-y-2">
                      {questions.behavioral.map((q: string, i: number) => (
                        <p key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                          {q}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-primary mb-2">Technical ({questions.technical.length})</h3>
                    <div className="space-y-2">
                      {questions.technical.map((q: string, i: number) => (
                        <p key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                          {q}
                        </p>
                      ))}
                    </div>
                  </div>

                  {questions.roleSpecific?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-primary mb-2">Role-Specific ({questions.roleSpecific.length})</h3>
                      <div className="space-y-2">
                        {questions.roleSpecific.map((q: string, i: number) => (
                          <p key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                            {q}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setState('select')}
                  className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartMockInterview}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all glow-primary-sm"
                >
                  <Brain className="h-4 w-4" />
                  Start Mock Interview (5 questions)
                </button>
              </div>
            </motion.div>
          )}

          {/* Mock interview */}
          {state === 'interview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-2">
                {interviewQuestions.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-300',
                      i < currentQ ? 'bg-success' : i === currentQ ? 'bg-primary' : 'bg-secondary'
                    )}
                  />
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {interviewQuestions.length}</p>
                <p className="text-base font-medium text-foreground leading-relaxed mb-4">
                  {interviewQuestions[currentQ]}
                </p>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Type your answer here... Use the STAR method: Situation, Task, Action, Result"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />

                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-muted-foreground">Scoring is based on STAR + role alignment. Add specifics to improve.</p>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim() || loadingFeedback}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingFeedback ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><ArrowRight className="h-4 w-4" /> Submit & Get Feedback</>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading skeleton */}
              {loadingFeedback && (
                <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-1/3 rounded bg-muted" />
                      <div className="h-2 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-2 w-4/5 rounded bg-muted" />
                  <div className="h-2 w-3/5 rounded bg-muted" />
                </div>
              )}

              {/* Previous feedback */}
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
              {/* Confidence meter */}
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <h2 className="text-lg font-bold text-foreground mb-2">Mock Interview Complete</h2>
                <p className="text-sm text-muted-foreground mb-6">{selectedApp.role} at {selectedApp.company}</p>

                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-secondary" />
                    <circle
                      cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                      className={cn(
                        overallScore >= 75 ? 'stroke-success' : overallScore >= 50 ? 'stroke-warning' : 'stroke-destructive'
                      )}
                      strokeLinecap="round"
                      strokeDasharray={`${(overallScore / 100) * 327} 327`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className={cn('text-3xl font-bold', getScoreColor(overallScore))}>{overallScore}</span>
                    <p className={cn('text-xs font-medium', getScoreColor(overallScore))}>{getScoreLabel(overallScore)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>

              {/* Detailed feedback */}
              <div className="space-y-4">
                {feedback.map((f, i) => (
                  <FeedbackCard key={i} fb={f} index={i} onCopy={() => handleCopyAnswer(i)} copied={copiedIdx === i} />
                ))}
              </div>

              <button
                onClick={() => { setState('select'); setQuestions(null); setFeedback([]); }}
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

// Feedback card component
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

      {/* Rubric breakdown */}
      <div className="grid grid-cols-5 gap-2">
        <RubricBar label="Relevance" score={rb.relevance} max={25} />
        <RubricBar label="STAR" score={rb.star} max={25} />
        <RubricBar label="Evidence" score={rb.evidence} max={25} />
        <RubricBar label="Role Fit" score={rb.roleAlignment} max={15} />
        <RubricBar label="Clarity" score={rb.clarity} max={10} />
      </div>

      {/* STAR missing chips */}
      {fb.starAnalysis.missing.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <AlertCircle className="h-3 w-3 text-warning shrink-0" />
          {fb.starAnalysis.missing.map((m) => (
            <span key={m} className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
              Missing {m}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-success mb-1">Strengths</p>
          {fb.strengths.map((s, j) => (
            <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-success shrink-0 mt-0.5" />
              {s}
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
            <button
              onClick={onCopy}
              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-3">{fb.rewrittenAnswer}</p>
        </div>
      )}

      {fb.nextQuestion && !compact && (
        <div className="border-t border-border pt-2">
          <p className="text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground">Likely follow-up:</span> {fb.nextQuestion}
          </p>
        </div>
      )}
    </div>
  );
}
