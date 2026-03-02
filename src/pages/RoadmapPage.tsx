import { Layout } from '@/components/Layout';
import { useParams, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Enhancement {
  slug: string;
  title: string;
  description: string;
  tag: string;
}

const allEnhancements: Enhancement[] = [
  { slug: 'ai-interview-replay-analytics', title: 'AI Interview Replay Analytics', description: 'Provide detailed breakdown of candidate responses including clarity score, confidence score, and improvement suggestions.', tag: 'Prep Studio' },
  { slug: 'role-specific-interview-simulations', title: 'Role-Specific Interview Simulations', description: 'Generate interview scenarios tailored to the exact role and job description.', tag: 'Prep Studio' },
  { slug: 'interview-readiness-score', title: 'Interview Readiness Score', description: 'A dynamic readiness indicator showing how prepared a candidate is for the next stage.', tag: 'Prep Studio' },
  { slug: 'advanced-resume-ats-scoring', title: 'Advanced Resume ATS Scoring', description: 'Provide detailed ATS compatibility score and keyword coverage analysis.', tag: 'Resume Lab' },
  { slug: 'resume-version-management', title: 'Resume Version Management', description: 'Allow candidates to maintain multiple role-specific resume versions.', tag: 'Resume Lab' },
  { slug: 'skill-gap-intelligence', title: 'Skill Gap Intelligence', description: 'Identify missing skills compared to job descriptions and recommend learning resources.', tag: 'Resume Lab' },
  { slug: 'application-activity-insights', title: 'Application Activity Insights', description: 'Show when recruiters view profiles, current review stage, and estimated response timelines.', tag: 'Dashboard' },
  { slug: 'application-health-score', title: 'Application Health Score', description: 'A score indicating how strong the candidate\'s application is for the role.', tag: 'Dashboard' },
  { slug: 'ai-hiring-stage-guidance', title: 'AI Hiring Stage Guidance', description: 'Provide actionable suggestions for each hiring stage.', tag: 'Dashboard' },
  { slug: 'recruiter-feedback-summaries', title: 'Recruiter Feedback Summaries', description: 'Generate constructive insights even for rejected applications.', tag: 'Dashboard' },
  { slug: 'ai-career-coach', title: 'AI Career Coach', description: 'Suggest future roles, skill improvements, and career progression paths.', tag: 'Dashboard' },
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
          Candidate OS is continuously evolving to improve transparency, preparation, and guidance throughout the hiring journey. Select an item from the sidebar to learn more.
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

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">More details coming soon</CardTitle>
          <CardDescription className="text-xs">
            This feature is currently in our roadmap. Stay tuned for updates on timelines and detailed specifications.
          </CardDescription>
        </CardHeader>
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
