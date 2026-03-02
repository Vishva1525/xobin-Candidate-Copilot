import { Layout } from '@/components/Layout';
import { useParams, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, CheckCircle2, Lightbulb, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Enhancement {
  slug: string;
  title: string;
  description: string;
  tag: string;
  detail: {
    overview: string;
    keyCapabilities: string[];
    howItWorks: string;
    whyItMatters: string;
  };
}

const allEnhancements: Enhancement[] = [
  {
    slug: 'ai-interview-replay-analytics',
    title: 'AI Interview Replay Analytics',
    description: 'Provide detailed breakdown of candidate responses including clarity score, confidence score, and improvement suggestions.',
    tag: 'Prep Studio',
    detail: {
      overview: 'AI Interview Replay Analytics transforms every mock interview into a powerful learning experience. After completing a practice interview session, candidates receive an in-depth, AI-generated analysis of their performance — covering verbal clarity, response structure, confidence signals, and topic relevance.',
      keyCapabilities: [
        'Clarity Score — Measures how clearly and concisely you communicated your answers',
        'Confidence Score — Analyzes vocal tone, pacing, and filler word usage to gauge confidence',
        'Content Relevance — Evaluates how well responses align with the question topic',
        'Improvement Suggestions — Actionable, personalized tips to refine weak areas',
        'Response Timeline — Visual breakdown of time spent on each question',
      ],
      howItWorks: 'Once a mock interview ends, the AI processes the full session recording — analyzing speech patterns, answer structure, and keyword relevance against the target role. The result is a comprehensive scorecard with drill-down insights for each question answered.',
      whyItMatters: 'Most candidates practice interviews without structured feedback. Replay Analytics closes this gap by providing the same caliber of feedback a professional interview coach would give — instantly and at scale.',
    },
  },
  {
    slug: 'role-specific-interview-simulations',
    title: 'Role-Specific Interview Simulations',
    description: 'Generate interview scenarios tailored to the exact role and job description.',
    tag: 'Prep Studio',
    detail: {
      overview: 'Role-Specific Interview Simulations generate hyper-targeted practice sessions based on the exact job description, required skills, and company context. Instead of generic behavioral questions, candidates face the kinds of questions they will actually encounter.',
      keyCapabilities: [
        'Job Description Parsing — Extracts key competencies, tools, and expectations from JDs',
        'Dynamic Question Generation — Creates technical, behavioral, and situational questions unique to the role',
        'Difficulty Scaling — Adjusts complexity from entry-level to senior based on candidate profile',
        'Industry-Specific Scenarios — Tailors questions to domain (fintech, healthcare, SaaS, etc.)',
        'Multi-Round Simulation — Mimics screening, technical, and final-round interview formats',
      ],
      howItWorks: 'Candidates paste or select a job description, and the AI builds a custom interview simulation. The system identifies the core competencies required and generates a question set that mirrors real-world interviews for that specific role and seniority.',
      whyItMatters: 'Generic practice doesn\'t prepare candidates for the nuances of specific roles. This feature ensures every practice minute is spent on questions that directly map to the opportunity being pursued.',
    },
  },
  {
    slug: 'interview-readiness-score',
    title: 'Interview Readiness Score',
    description: 'A dynamic readiness indicator showing how prepared a candidate is for the next stage.',
    tag: 'Prep Studio',
    detail: {
      overview: 'The Interview Readiness Score is a dynamic, always-updated metric that reflects how well-prepared a candidate is for their upcoming interview stage. It aggregates data from practice sessions, resume strength, role alignment, and skill coverage into a single actionable score.',
      keyCapabilities: [
        'Composite Readiness Metric — Blends practice performance, skill coverage, and resume fit',
        'Stage-Aware Scoring — Adapts based on whether the next step is screening, technical, or behavioral',
        'Trend Tracking — Shows improvement trajectory over time',
        'Gap Alerts — Flags specific areas that need more preparation',
        'Benchmark Comparison — Compares readiness against successful candidates for similar roles',
      ],
      howItWorks: 'The system continuously monitors your activity across Prep Studio, Resume Lab, and application context. Each interaction — mock interview, resume update, skill assessment — feeds into a weighted algorithm that produces your readiness percentage and specific recommendations.',
      whyItMatters: 'Candidates often don\'t know when they\'re truly ready. This score removes guesswork, providing a clear signal of preparedness and directing effort where it matters most.',
    },
  },
  {
    slug: 'advanced-resume-ats-scoring',
    title: 'Advanced Resume ATS Scoring',
    description: 'Provide detailed ATS compatibility score and keyword coverage analysis.',
    tag: 'Resume Lab',
    detail: {
      overview: 'Advanced ATS Scoring goes beyond simple keyword matching. It simulates how leading Applicant Tracking Systems parse, rank, and filter resumes — giving candidates a true picture of how their resume performs in automated screening before a human ever sees it.',
      keyCapabilities: [
        'ATS Compatibility Score — Overall score reflecting how well the resume passes automated filters',
        'Keyword Coverage Map — Visual heatmap showing matched vs. missing keywords from the job description',
        'Format Compliance Check — Validates structure, headings, and file format for ATS readability',
        'Section-by-Section Analysis — Scores each resume section (experience, skills, education) independently',
        'Optimization Suggestions — Specific rewording and restructuring recommendations',
      ],
      howItWorks: 'Upload your resume and optionally provide a target job description. The system parses both documents, runs the resume through simulated ATS algorithms, and produces a detailed compatibility report with actionable improvement steps.',
      whyItMatters: 'Up to 75% of resumes are rejected by ATS before reaching a recruiter. Understanding exactly how your resume performs in these systems is critical to getting past the first gate.',
    },
  },
  {
    slug: 'resume-version-management',
    title: 'Resume Version Management',
    description: 'Allow candidates to maintain multiple role-specific resume versions.',
    tag: 'Resume Lab',
    detail: {
      overview: 'Resume Version Management enables candidates to create, organize, and maintain multiple tailored resume versions — each optimized for a different role, industry, or company. No more overwriting your one resume for every new application.',
      keyCapabilities: [
        'Multi-Version Storage — Save unlimited resume variants with descriptive labels',
        'Role Tagging — Tag each version by target role, industry, or company',
        'Side-by-Side Comparison — Compare two versions to see differences in content and scoring',
        'Version History — Track changes over time with full revision history',
        'Quick Duplicate & Edit — Clone an existing version as a starting point for a new role',
      ],
      howItWorks: 'From Resume Lab, create a new version by duplicating an existing resume or starting fresh. Each version is independently scored and tracked. When applying to a role, select the version that best matches the job requirements.',
      whyItMatters: 'A single generic resume significantly reduces interview chances. Tailored resumes that speak directly to a role\'s requirements can increase callback rates by 3-5x.',
    },
  },
  {
    slug: 'skill-gap-intelligence',
    title: 'Skill Gap Intelligence',
    description: 'Identify missing skills compared to job descriptions and recommend learning resources.',
    tag: 'Resume Lab',
    detail: {
      overview: 'Skill Gap Intelligence analyzes the gap between your current skillset and the requirements of your target roles. It identifies exactly which skills, tools, and certifications you need to acquire — and recommends the fastest path to close those gaps.',
      keyCapabilities: [
        'Gap Analysis Dashboard — Visual comparison of your skills vs. job requirements',
        'Priority Ranking — Skills ranked by how impactful they are for your target roles',
        'Learning Resource Recommendations — Curated links to courses, tutorials, and certifications',
        'Progress Tracking — Monitor skill acquisition over time',
        'Cross-Role Analysis — See which skills unlock the most opportunities across multiple roles',
      ],
      howItWorks: 'The system extracts skills from your resume and compares them against skills mentioned in your target job descriptions. Missing or underrepresented skills are identified, prioritized by frequency and importance, and paired with relevant learning resources.',
      whyItMatters: 'Knowing what you\'re missing is the first step to becoming a stronger candidate. Skill Gap Intelligence turns vague career development into a concrete, actionable plan.',
    },
  },
  {
    slug: 'application-activity-insights',
    title: 'Application Activity Insights',
    description: 'Show when recruiters view profiles, current review stage, and estimated response timelines.',
    tag: 'Dashboard',
    detail: {
      overview: 'Application Activity Insights brings transparency to the black box of hiring. Candidates gain visibility into when their application was viewed, which stage it\'s currently in, and estimated timelines for next steps — reducing anxiety and enabling smarter follow-up decisions.',
      keyCapabilities: [
        'Profile View Notifications — Know when a recruiter has viewed your application or profile',
        'Stage Tracking — Real-time visibility into which review stage your application is in',
        'Estimated Response Timeline — AI-predicted timelines based on historical data for similar roles',
        'Activity Feed — Chronological log of all events related to each application',
        'Engagement Score — Indicates how actively the employer is reviewing your application',
      ],
      howItWorks: 'As recruiters interact with your application within the platform, activity events are logged and surfaced in your dashboard. The AI also analyzes historical patterns for similar roles and companies to predict expected response windows.',
      whyItMatters: 'The biggest frustration for candidates is the silence after applying. Activity Insights turns the waiting period into an informed, less stressful experience.',
    },
  },
  {
    slug: 'application-health-score',
    title: 'Application Health Score',
    description: 'A score indicating how strong the candidate\'s application is for the role.',
    tag: 'Dashboard',
    detail: {
      overview: 'Application Health Score provides a single, easy-to-understand metric that tells candidates how competitive their application is for a specific role. It evaluates resume fit, skill alignment, experience level, and overall application completeness.',
      keyCapabilities: [
        'Composite Health Metric — Weighted score combining resume fit, skills match, and application completeness',
        'Strength Indicators — Highlights what\'s working well in your application',
        'Weakness Alerts — Flags areas dragging your score down with specific fix suggestions',
        'Competitive Positioning — Contextualizes your score against typical successful applications',
        'Improvement Roadmap — Step-by-step actions to boost your score before the deadline',
      ],
      howItWorks: 'When you apply to a role, the system evaluates your resume, profile, and application materials against the job requirements. A health score is generated and continuously updated as you make improvements or as application context changes.',
      whyItMatters: 'Most candidates apply and hope for the best. Health Score gives you a data-driven view of where you stand — and what you can still do to strengthen your position.',
    },
  },
  {
    slug: 'ai-hiring-stage-guidance',
    title: 'AI Hiring Stage Guidance',
    description: 'Provide actionable suggestions for each hiring stage.',
    tag: 'Dashboard',
    detail: {
      overview: 'AI Hiring Stage Guidance delivers personalized, stage-specific advice as candidates progress through the hiring pipeline. Whether you\'re in screening, assessment, or final interview — the AI provides relevant preparation tips, dos and don\'ts, and insider context.',
      keyCapabilities: [
        'Stage-Specific Tips — Tailored advice for screening, technical, behavioral, and final rounds',
        'Company Context — Insights about the company\'s interview style and culture when available',
        'Preparation Checklists — Action items to complete before each stage',
        'Common Pitfalls — Warnings about frequent mistakes at each stage',
        'Follow-Up Templates — Suggested post-interview follow-up messages',
      ],
      howItWorks: 'As your application moves between stages, the AI detects the transition and generates a new set of guidance materials. These are based on the role type, company, and your personal preparation history.',
      whyItMatters: 'Each hiring stage has different expectations and evaluation criteria. Stage-aware guidance ensures candidates are optimally prepared for what\'s actually coming next.',
    },
  },
  {
    slug: 'recruiter-feedback-summaries',
    title: 'Recruiter Feedback Summaries',
    description: 'Generate constructive insights even for rejected applications.',
    tag: 'Dashboard',
    detail: {
      overview: 'Recruiter Feedback Summaries transform the typical rejection experience into a learning opportunity. When feedback is available, the AI synthesizes it into clear, constructive takeaways. When it\'s not, the system generates probable improvement areas based on the role requirements and application strength.',
      keyCapabilities: [
        'Feedback Synthesis — Converts raw recruiter notes into clear, actionable summaries',
        'AI-Inferred Insights — When no feedback is provided, generates probable areas for improvement',
        'Pattern Detection — Identifies recurring themes across multiple rejections',
        'Positive Reinforcement — Highlights strengths acknowledged in feedback',
        'Next Steps Suggestions — Recommends concrete actions to address feedback for future applications',
      ],
      howItWorks: 'After an application concludes, the system checks for any recruiter-provided feedback. If available, it\'s summarized into digestible insights. If not, the AI cross-references your application materials with the role requirements to infer likely improvement areas.',
      whyItMatters: 'Rejection without feedback is a dead end. Feedback Summaries ensure every application — successful or not — contributes to the candidate\'s growth and future success.',
    },
  },
  {
    slug: 'ai-career-coach',
    title: 'AI Career Coach',
    description: 'Suggest future roles, skill improvements, and career progression paths.',
    tag: 'Dashboard',
    detail: {
      overview: 'AI Career Coach acts as a long-term career advisor, analyzing your skills, experience, and aspirations to map out potential career paths. It suggests roles you may not have considered, identifies skills that unlock new opportunities, and helps plan multi-year career progression.',
      keyCapabilities: [
        'Career Path Mapping — Visualize potential career trajectories based on your current profile',
        'Role Discovery — Surface roles you\'re qualified for but may not have considered',
        'Skill Investment Advice — Recommend which skills offer the highest career ROI',
        'Salary Trajectory Insights — Projected earning potential across different career paths',
        'Milestone Planning — Set and track career milestones with suggested timelines',
      ],
      howItWorks: 'The AI analyzes your complete profile — skills, experience, education, and stated goals — against labor market data and successful career trajectories. It generates personalized recommendations for immediate next steps and long-term career planning.',
      whyItMatters: 'Career planning is complex and most people navigate it without guidance. AI Career Coach democratizes access to strategic career advice that was previously only available through expensive coaching or fortunate mentorship.',
    },
  },
  {
    slug: 'candidate-pulse-feedback',
    title: 'Candidate Pulse — Voice of the Candidate',
    description: 'Capture real-time candidate sentiment to measure hiring experience quality and continuously improve it.',
    tag: 'Dashboard',
    detail: {
      overview: 'Candidate Pulse transforms the hiring process into a two-way conversation. At key moments throughout the journey — after applying, completing assessments, finishing interviews, and receiving outcomes — candidates are prompted with micro-surveys and sentiment checks. This creates a continuous feedback loop that surfaces what\'s working, what\'s frustrating, and where the experience breaks down.',
      keyCapabilities: [
        'Stage-Triggered Micro-Surveys — Short, contextual feedback prompts after each hiring stage (2-3 questions max)',
        'Sentiment Tracking Dashboard — Real-time visualization of candidate satisfaction across the entire pipeline',
        'NPS & CSAT Scoring — Industry-standard Net Promoter Score and Candidate Satisfaction metrics per role and stage',
        'Pain Point Detection — AI identifies recurring friction points and ranks them by severity and frequency',
        'Anonymized Trend Reports — Aggregated insights that protect candidate identity while revealing systemic issues',
        'Actionable Recommendations — AI-generated suggestions for improving stages with the lowest satisfaction scores',
      ],
      howItWorks: 'As candidates transition between hiring stages, the system triggers lightweight, non-intrusive feedback moments — a quick emoji reaction, a 1-5 star rating, or a one-sentence open-ended prompt. Responses are aggregated in real-time, analyzed by AI for patterns and sentiment, and surfaced as actionable dashboards for the recruiting team. Over time, the system builds a "Candidate Experience Index" that benchmarks the hiring process against industry standards.',
      whyItMatters: 'Companies spend millions on employer branding but rarely measure the actual candidate experience. 60% of candidates who have a negative experience share it publicly. Candidate Pulse closes the feedback gap — giving recruiters the data they need to fix broken processes, celebrate what works, and build a hiring experience that candidates genuinely recommend.',
    },
  },
];

function OverviewPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Future Roadmap</h1>
          <Badge variant="secondary" className="text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          xobin Candidate Copilot is continuously evolving to improve transparency, preparation, and guidance throughout the hiring journey. Select an item from the sidebar to learn more.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {allEnhancements.map((item, i) => (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link to={`/roadmap/${item.slug}`}>
              <Card className="group h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-snug">{item.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0 text-[10px] text-muted-foreground">{item.tag}</Badge>
                  </div>
                  <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DetailPage({ item }: { item: Enhancement }) {
  const { detail } = item;

  return (
    <motion.div
      key={item.slug}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <Link to="/roadmap" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        All Enhancements
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{item.title}</h1>
          <Badge variant="secondary" className="text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">{item.tag}</Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{item.description}</p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{detail.overview}</p>
        </CardContent>
      </Card>

      {/* Key Capabilities */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Key Capabilities</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {detail.keyCapabilities.map((cap, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{cap}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">How It Works</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{detail.howItWorks}</p>
        </CardContent>
      </Card>

      {/* Why It Matters */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-primary">Why It Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80 leading-relaxed">{detail.whyItMatters}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RoadmapPage() {
  const { slug } = useParams<{ slug: string }>();

  const item = slug ? allEnhancements.find(e => e.slug === slug) : null;

  if (slug && !item) {
    return <Navigate to="/roadmap" replace />;
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {item ? <DetailPage item={item} /> : <OverviewPage />}
      </div>
    </Layout>
  );
}
