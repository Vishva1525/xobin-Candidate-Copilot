import { useState, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { AIActionButton } from '@/components/AIActionButton';
import { ResumeHealthCard } from '@/components/ResumeHealthCard';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRoleContext } from '@/hooks/use-role-context';
import { xobinApplication, sampleResumeText } from '@/lib/mock-data';
import { callAI } from '@/lib/ai-service';
import { extractTextFromFile } from '@/lib/resume-parser';
import { ResumeSections, ResumeHealth, TailoredDraft } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, Copy, Check, ClipboardPaste, Loader2, AlertTriangle, CheckCircle2, Compass, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function parseResumeSections(text: string): ResumeSections {
  const lines = text.split('\n').filter(l => l.trim());
  
  // --- Name extraction ---
  // Common designations/titles to strip from the name line
  const designations = /\b(software\s*(developer|engineer|dev)|developer|engineer|designer|analyst|intern|manager|architect|consultant|associate|executive|specialist|lead|sr\.?|jr\.?|senior|junior|full[- ]?stack|front[- ]?end|back[- ]?end|data\s*scientist|data\s*engineer|product\s*designer|ux\s*designer|ui\s*designer|web\s*developer|devops|qa|tester|trainee)\b/gi;
  
  const rawFirstLine = (lines[0] || '').trim();
  // Split on common separators: pipe, dash, comma, em-dash
  const nameParts = rawFirstLine.split(/[|–—,\-]/).map(s => s.trim());
  
  // Pick the part that looks most like a name (no digits, no @, no designation keywords, reasonable length)
  let bestName = '';
  for (const part of nameParts) {
    const cleaned = part.replace(designations, '').trim();
    if (
      cleaned.length >= 2 &&
      cleaned.length < 50 &&
      !cleaned.includes('@') &&
      !/\d{3,}/.test(cleaned) &&      // no long digit sequences (phone numbers)
      !/^https?:\/\//.test(cleaned) && // no URLs
      !cleaned.match(/\.(com|org|net|io|in|dev)$/i) // no domains
    ) {
      bestName = cleaned;
      break;
    }
  }
  if (!bestName) bestName = nameParts[0]?.replace(designations, '').trim() || rawFirstLine.slice(0, 40);
  // Remove trailing/leading special chars
  bestName = bestName.replace(/^[\s\-–—|,.:]+|[\s\-–—|,.:]+$/g, '').trim();

  // --- Email & Phone extraction ---
  // Search first ~10 lines for contact info
  const headerText = lines.slice(0, 10).join(' ');
  const emailMatch = headerText.match(/[\w.+\-]+@[\w.\-]+\.\w{2,}/);
  
  // Robust phone: look for patterns like +91 8668101068, (555) 123-4567, etc.
  const phoneMatch = headerText.match(/(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/);
  // Clean phone: remove extra spaces
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ').trim() : '';

  const skills: string[] = [];
  const experience: ResumeSections['experience'] = [];
  const education: ResumeSections['education'] = [];

  let section = '';
  let currentExp: any = null;

  const sectionHeaders = [
    { keys: ['CORE SKILLS', 'TECHNICAL SKILLS', 'SKILLS'], section: 'skills' },
    { keys: ['WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EXPERIENCE', 'WORK HISTORY'], section: 'experience' },
    { keys: ['EDUCATION'], section: 'education' },
    { keys: ['PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE', 'PROFILE'], section: 'summary' },
    { keys: ['PROJECTS'], section: 'projects' },
    { keys: ['CERTIFICATIONS', 'CERTIFICATES'], section: 'certifications' },
  ];

  for (const line of lines) {
    const upper = line.toUpperCase().trim().replace(/[:\-–—]/g, '').trim();
    
    const matchedSection = sectionHeaders.find(sh => sh.keys.some(k => upper === k || upper.startsWith(k + ' ')));
    if (matchedSection) {
      if (currentExp && section === 'experience') { experience.push(currentExp); currentExp = null; }
      section = matchedSection.section;
      continue;
    }

    if (section === 'skills' && line.trim()) {
      const colonIdx = line.indexOf(':');
      const skillText = colonIdx > 0 && colonIdx < 40 ? line.slice(colonIdx + 1) : line;
      skills.push(...skillText.split(/[,;•·|]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60));
    }
    if (section === 'experience') {
      if ((line.includes('|') || line.includes('–') || line.includes('—')) && !line.startsWith('•') && !line.startsWith('-') && line.length < 120) {
        if (currentExp) experience.push(currentExp);
        const parts = line.split(/[|–—]/).map(s => s.trim());
        currentExp = { role: parts[0], company: parts[1] || '', duration: parts[2] || '', bullets: [] };
      } else if ((line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('●')) && currentExp) {
        currentExp.bullets.push(line.replace(/^[•\-*●]\s*/, '').trim());
      } else if (currentExp && line.trim().length > 10 && !line.match(/^[A-Z\s]{5,}$/)) {
        currentExp.bullets.push(line.trim());
      }
    }
    if (section === 'education' && line.trim()) {
      const parts = line.split(/[|–—]/).map(s => s.trim());
      if (parts.length >= 2) {
        education.push({ degree: parts[0], school: parts[1], year: parts[2] || '' });
      } else if (parts[0].length > 5) {
        education.push({ degree: parts[0], school: '', year: '' });
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  if (skills.length === 0) {
    const allText = text.toUpperCase();
    const knownSkills = [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
      'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'CI/CD',
      'REST APIs', 'GraphQL', 'WebSocket',
      'TensorFlow', 'PyTorch', 'OpenCV', 'MediaPipe', 'Scikit-learn',
      'Figma', 'Sketch', 'Adobe XD',
      'Linux', 'Bash', 'Terraform', 'Jenkins',
      'Agile', 'Scrum', 'Jira',
    ];
    for (const skill of knownSkills) {
      if (allText.includes(skill.toUpperCase())) {
        skills.push(skill);
      }
    }
  }

  return {
    contact: { name: bestName, email: emailMatch?.[0] || '', phone },
    skills,
    experience,
    education,
  };
}

interface StoredDraft {
  draft: TailoredDraft;
  generatedAt: string;
}

export default function ResumeLab() {
  const [resumeText, setResumeText] = useLocalStorage<string>('candidateos_resume', '');
  const [resumeSections, setResumeSections] = useLocalStorage<ResumeSections | null>('candidateos_sections', null);
  const [resumeHealth, setResumeHealth] = useLocalStorage<ResumeHealth | null>('candidateos_health', null);
  const [tailoredDraftsByRoleId, setTailoredDraftsByRoleId] = useLocalStorage<Record<string, StoredDraft>>('candidateos_drafts_by_role', {});
  const [showPaste, setShowPaste] = useState(false);
  const [copied, setCopied] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState(0);

  const { activeRole, isExploring, clearExploration } = useRoleContext();

  const selectedRoleId = activeRole.roleId;
  const selectedRoleTitle = activeRole.roleTitle;
  const selectedRoleJD = activeRole.jdFull;
  const selectedCompany = activeRole.company;

  const currentDraftEntry = tailoredDraftsByRoleId[selectedRoleId] || null;
  const tailoredDraft = currentDraftEntry?.draft || null;

  const processResume = useCallback(async (text: string) => {
    setResumeText(text);
    const sections = parseResumeSections(text);
    setResumeSections(sections);
    const result = await callAI('parse_resume_feedback', { resumeText: text });
    setResumeHealth(result.health);
    toast.success('Resume parsed successfully');
  }, [setResumeText, setResumeSections, setResumeHealth]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setExtractionError(null);
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length > 20) {
        await processResume(text);
      } else {
        setExtractionError("We couldn't extract enough text from this file. Please paste your resume text below.");
        setShowPaste(true);
      }
    } catch (err) {
      console.error('File extraction error:', err);
      setExtractionError("We couldn't read this file. Please paste your resume text below.");
      setShowPaste(true);
    } finally {
      setExtracting(false);
    }
  };

  const handlePasteSubmit = async (text: string) => {
    if (text.trim().length > 20) {
      setExtractionError(null);
      await processResume(text);
    }
  };

  const handleUseSample = async () => {
    await processResume(sampleResumeText);
  };

  const handleCopyDraft = () => {
    if (!tailoredDraft) return;
    const text = `PROFESSIONAL SUMMARY\n${tailoredDraft.summary}\n\nKEY ACHIEVEMENTS\n${tailoredDraft.bullets.map(b => `• ${b.improved}`).join('\n')}\n\nSUGGESTED KEYWORDS\n${tailoredDraft.suggestedKeywords.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Tailored draft copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const hasResume = !!resumeText;

  return (
    <Layout>
      <div className="flex h-full">
        {/* Left panel — Resume */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-2xl font-bold text-foreground mb-1">Resume Lab</h1>
            <p className="text-sm text-muted-foreground mb-2">Tailoring for: <span className="font-medium text-foreground">{selectedRoleTitle}</span> at Xobin</p>

            {/* Exploration context banner */}
            {isExploring && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 mb-4 flex items-center justify-between">
                <p className="text-xs text-warning font-medium">
                  <Compass className="inline h-3 w-3 mr-1" />
                  Context: Exploring <span className="font-bold">{selectedRoleTitle}</span>
                </p>
                <button
                  onClick={clearExploration}
                  className="text-xs text-warning hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" /> Back to my application
                </button>
              </div>
            )}

            {!hasResume ? (
              <div className="space-y-4">
                {/* Upload area */}
                <label className={cn(
                  "group flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card/50 p-12 cursor-pointer transition-colors",
                  extracting ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40"
                )}>
                  {extracting ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary mb-3 animate-spin" />
                      <p className="text-sm font-medium text-foreground">Extracting text from your resume...</p>
                      <p className="text-xs text-muted-foreground mt-1">This may take a moment for large files</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium text-foreground">Upload resume</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF or DOCX — we'll extract the text</p>
                    </>
                  )}
                  <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileUpload} className="hidden" disabled={extracting} />
                </label>

                {extractionError && (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-warning">{extractionError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaste(true)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground hover:border-primary/30 transition-colors"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                    Paste resume text
                  </button>
                  <button
                    onClick={handleUseSample}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground hover:border-primary/30 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Use sample resume
                  </button>
                </div>

                {showPaste && (
                  <PasteResumeArea onSubmit={handlePasteSubmit} />
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resume loaded indicator */}
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <p className="text-sm text-success font-medium">Resume loaded — available in Prep Studio & AI actions</p>
                </div>

                {/* Parsed sections */}
                {resumeSections && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Contact */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <h3 className="text-sm font-semibold text-card-foreground mb-3">Contact</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                          <p className="font-medium text-foreground break-words">{resumeSections.contact.name}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="font-medium text-foreground break-all">{resumeSections.contact.email || '—'}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <p className="font-medium text-foreground">{resumeSections.contact.phone || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {resumeSections.skills.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="text-sm font-semibold text-card-foreground mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeSections.skills.map((skill, i) => (
                            <span key={i} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeSections.experience.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="text-sm font-semibold text-card-foreground mb-3">Experience</h3>
                        <div className="space-y-4">
                          {resumeSections.experience.map((exp, i) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-foreground">{exp.role} <span className="text-muted-foreground">at {exp.company}</span></p>
                              {exp.duration && <p className="text-xs text-muted-foreground mt-0.5">{exp.duration}</p>}
                              <ul className="mt-1.5 space-y-1">
                                {exp.bullets.map((b, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex gap-2">
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resumeSections.education.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="text-sm font-semibold text-card-foreground mb-3">Education</h3>
                        {resumeSections.education.map((ed, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{ed.degree} — {ed.school} {ed.year && `(${ed.year})`}</p>
                        ))}
                      </div>
                    )}

                    {/* Reset */}
                    <button
                      onClick={() => { setResumeText(''); setResumeSections(null); setResumeHealth(null); setTailoredDraftsByRoleId({}); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Upload a different resume
                    </button>
                  </motion.div>
                )}

                {/* Tailored Draft — per role */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRoleId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {tailoredDraft ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">Tailored Resume Draft</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              For {selectedRoleTitle} at {selectedCompany}
                              {currentDraftEntry?.generatedAt && (
                                <> · Generated {new Date(currentDraftEntry.generatedAt).toLocaleString()}</>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={handleCopyDraft}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110 transition-all"
                          >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied ? 'Copied!' : 'Copy draft'}
                          </button>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Professional Summary</p>
                          <p className="text-sm text-foreground leading-relaxed">{tailoredDraft.summary}</p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Improved Bullets</p>
                          <div className="space-y-3">
                            {tailoredDraft.bullets.map((b, i) => (
                              <div key={i} className="space-y-1">
                                <p className="text-xs text-muted-foreground line-through">{b.original}</p>
                                <p className="text-xs text-foreground">→ {b.improved}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Suggested Keywords</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tailoredDraft.suggestedKeywords.map((kw, i) => (
                              <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">ATS Keyword Match</p>
                          <span className="text-lg font-bold text-success">{tailoredDraft.atsMatchPercentage}%</span>
                        </div>
                      </div>
                    ) : hasResume ? (
                      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
                        <Sparkles className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No tailored draft yet for <span className="font-medium text-foreground">{selectedRoleTitle}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Use the "Tailor my resume" action on the right →</p>
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right panel — AI Actions */}
        <div className="hidden lg:block w-80 border-l border-border bg-card/30 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">AI Actions</h2>
          </div>

          {!hasResume ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-4 text-center">
              <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Upload or paste your resume first to unlock AI actions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Exploration context banner */}
              {isExploring && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 flex items-center justify-between">
                  <p className="text-[11px] text-warning font-medium">
                    <Compass className="inline h-3 w-3 mr-1" />
                    Exploring: {selectedRoleTitle}
                  </p>
                  <button onClick={clearExploration} className="text-[11px] text-warning hover:text-foreground flex items-center gap-0.5">
                    <X className="h-3 w-3" /> Reset
                  </button>
                </div>
              )}

              {/* Context banner */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">Tailoring for: {selectedRoleTitle}</p>
                    <p className="text-[10px] text-muted-foreground truncate">at {selectedCompany}</p>
                  </div>
                </div>
              </div>

              {/* Role context switcher */}
              <div className="rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Role Context</p>
                <p className="text-xs text-foreground font-medium">{selectedRoleTitle} (Xobin)</p>
                <p className="text-[10px] text-muted-foreground mt-1">Switch roles from the Dashboard → Explore Roles.</p>
              </div>

              {resumeHealth && <ResumeHealthCard health={resumeHealth} />}

              <AIActionButton
                key={actionKey}
                label="Tailor my resume for this role"
                description={`Generate a draft tailored for ${selectedRoleTitle}`}
                onClick={async () => {
                  const result = await callAI('tailor_resume_to_jd', {
                    resumeText,
                    jd: selectedRoleJD,
                    roleTitle: selectedRoleTitle,
                    company: selectedCompany,
                  });

                  setTailoredDraftsByRoleId(prev => ({
                    ...prev,
                    [selectedRoleId]: {
                      draft: result,
                      generatedAt: new Date().toISOString(),
                    },
                  }));

                  return result;
                }}
              >
                {(result) => (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-success">✓ Draft generated — see left panel</p>
                    <p className="text-xs text-muted-foreground">ATS Match: {result.atsMatchPercentage}%</p>
                  </div>
                )}
              </AIActionButton>

              {/* Show count of saved drafts */}
              {Object.keys(tailoredDraftsByRoleId).length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  {Object.keys(tailoredDraftsByRoleId).length} role{Object.keys(tailoredDraftsByRoleId).length > 1 ? 's' : ''} tailored
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Paste resume fallback component
function PasteResumeArea({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (text.trim().length < 20) return;
    setSubmitting(true);
    await onSubmit(text);
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Paste your resume text here..."
        className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {text.trim().length < 20 ? 'Paste at least a few lines of resume content' : '✓ Ready to parse'}
        </p>
        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 20 || submitting}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Parse Resume
        </button>
      </div>
    </div>
  );
}
