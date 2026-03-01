import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { mockApplications } from '@/lib/mock-data';
import { callAI } from '@/lib/ai-service';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Loader2, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type InterviewState = 'select' | 'questions' | 'interview' | 'summary';

export default function PrepStudio() {
  const [selectedAppId, setSelectedAppId] = useState(mockApplications[0].id);
  const [state, setState] = useState<InterviewState>('select');
  const [questions, setQuestions] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Mock interview state
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const selectedApp = mockApplications.find(a => a.id === selectedAppId)!;

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    const result = await callAI('generate_interview_questions', { jd: selectedApp.jobDescription });
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
    });
    const newFeedback = [...feedback, { question: interviewQuestions[currentQ], answer, ...result }];
    setFeedback(newFeedback);
    setLoadingFeedback(false);

    if (currentQ < interviewQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer('');
    } else {
      const avg = Math.round(newFeedback.reduce((s, f) => s + f.confidenceScore, 0) / newFeedback.length);
      setOverallScore(avg);
      setState('summary');
    }
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

                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim() || loadingFeedback}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingFeedback ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Getting feedback...</>
                    ) : (
                      <><ArrowRight className="h-4 w-4" /> Submit & Get Feedback</>
                    )}
                  </button>
                </div>
              </div>

              {/* Previous feedback */}
              {feedback.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Previous Feedback</h3>
                  {feedback.map((f, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
                      <p className="text-xs font-medium text-foreground">Q{i + 1}: {f.question}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-success">Score: {f.confidenceScore}%</span>
                        <span className="text-muted-foreground">
                          STAR: {f.starCheck.situation ? '✓' : '✗'}S {f.starCheck.task ? '✓' : '✗'}T {f.starCheck.action ? '✓' : '✗'}A {f.starCheck.result ? '✓' : '✗'}R
                        </span>
                      </div>
                    </div>
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
                      className="stroke-primary"
                      strokeLinecap="round"
                      strokeDasharray={`${(overallScore / 100) * 327} 327`}
                    />
                  </svg>
                  <span className="absolute text-3xl font-bold text-foreground">{overallScore}</span>
                </div>
                <p className="text-sm text-muted-foreground">Confidence Score</p>
              </div>

              {/* Detailed feedback */}
              <div className="space-y-4">
                {feedback.map((f, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-foreground flex-1">Q{i + 1}: {f.question}</p>
                      <span className={cn(
                        'shrink-0 ml-3 text-xs font-bold',
                        f.confidenceScore >= 75 ? 'text-success' : f.confidenceScore >= 50 ? 'text-warning' : 'text-destructive'
                      )}>
                        {f.confidenceScore}%
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
                      <p className="italic">"{f.answer}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-success mb-1">Strengths</p>
                        {f.strengths.map((s: string, j: number) => (
                          <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-0.5">
                            <CheckCircle2 className="h-3 w-3 text-success shrink-0 mt-0.5" />
                            {s}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-warning mb-1">Improvements</p>
                        {f.improvements.map((s: string, j: number) => (
                          <p key={j} className="text-xs text-muted-foreground mb-0.5">• {s}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Suggested Answer</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.suggestedAnswer}</p>
                    </div>
                  </div>
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