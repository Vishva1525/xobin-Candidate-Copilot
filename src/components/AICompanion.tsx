import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { callAI } from '@/lib/ai-service';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AICompanionProps {
  role: string;
  company: string;
  stage: string;
  jobDescription: string;
  resumeText?: string;
}

const PROMPT_CHIPS = [
  "Explain my current stage",
  "How do I prepare for the next step?",
  "What questions will I face for SDE?",
  "Draft a follow-up message",
];

export function AICompanion({ role, company, stage, jobDescription, resumeText }: AICompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const result = await callAI('ai_companion_answer', {
        userQuestion: text.trim(),
        roleTitle: role,
        company,
        currentStage: stage,
        jobDescription,
        resumeText: resumeText || '',
      });
      const answer = result.answer || result.response || 'I\'m not sure about that. Try rephrasing your question.';
      const followUps = result.followUpSuggestions || [];
      let content = answer;
      if (followUps.length > 0) {
        content += '\n\n**You might also ask:**\n' + followUps.map((f: string) => `- ${f}`).join('\n');
      }
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error. Please try again.` }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, role, company, stage, jobDescription, resumeText]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-primary/5">
        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">AI Companion</p>
          <p className="text-[10px] text-muted-foreground">{role} · {company}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-[320px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hi! I'm your AI companion for the <span className="font-medium text-foreground">{role}</span> role at <span className="font-medium text-foreground">{company}</span>. Ask me anything about your application journey.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-8">
              {PROMPT_CHIPS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}>
            {msg.role === 'assistant' && (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0'
            )}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3 w-3 text-accent-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <div className="flex items-center gap-1 px-3 py-2">
              <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your application..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-primary p-2 text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
