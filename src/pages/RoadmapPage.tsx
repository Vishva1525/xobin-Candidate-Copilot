import { Layout } from '@/components/Layout';
import { useParams, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface RoadmapPillar {
  title: string;
  description: string;
  features: Feature[];
}

const pillars: Record<string, RoadmapPillar> = {
  'prep-studio': {
    title: 'Prep Studio (AI Interview Preparation Platform)',
    description: 'Enhancing interview readiness with deeper AI-powered preparation tools.',
    features: [
      {
        title: 'AI Interview Replay Analytics',
        description: 'Provide detailed breakdown of candidate responses including clarity score, confidence score, and improvement suggestions.',
      },
      {
        title: 'Role-Specific Interview Simulations',
        description: 'Generate interview scenarios tailored to the exact role and job description.',
      },
      {
        title: 'Interview Readiness Score',
        description: 'A dynamic readiness indicator showing how prepared a candidate is for the next stage.',
      },
    ],
  },
  'resume-lab': {
    title: 'Resume Lab (AI Resume Optimization Workspace)',
    description: 'Making resume improvement faster, data-driven, and role-specific.',
    features: [
      {
        title: 'Advanced Resume ATS Scoring',
        description: 'Provide detailed ATS compatibility score and keyword coverage analysis.',
      },
      {
        title: 'Resume Version Management',
        description: 'Allow candidates to maintain multiple role-specific resume versions.',
      },
      {
        title: 'Skill Gap Intelligence',
        description: 'Identify missing skills compared to job descriptions and recommend learning resources.',
      },
    ],
  },
  dashboard: {
    title: 'Candidate Dashboard (Application Intelligence Hub)',
    description: 'Providing transparency and insights throughout the hiring process.',
    features: [
      {
        title: 'Application Activity Insights',
        description: 'Show when recruiters view profiles, current review stage, and estimated response timelines.',
      },
      {
        title: 'Application Health Score',
        description: 'A score indicating how strong the candidate\'s application is for the role.',
      },
      {
        title: 'AI Hiring Stage Guidance',
        description: 'Provide actionable suggestions for each hiring stage.',
      },
      {
        title: 'Recruiter Feedback Summaries',
        description: 'Generate constructive insights even for rejected applications.',
      },
      {
        title: 'AI Career Coach',
        description: 'Suggest future roles, skill improvements, and career progression paths.',
      },
    ],
  },
};

export default function RoadmapPage() {
  const { pillar } = useParams<{ pillar: string }>();

  if (!pillar || !pillars[pillar]) {
    return <Navigate to="/roadmap/prep-studio" replace />;
  }

  const data = pillars[pillar];

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <motion.div
          key={pillar}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Page header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Future Roadmap</h1>
              <Badge variant="secondary" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                Coming Soon
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Candidate OS is continuously evolving to improve transparency, preparation, and guidance throughout the hiring journey. Below are some upcoming capabilities planned for future releases.
            </p>
          </div>

          {/* Pillar header */}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{data.title}</h2>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>

          {/* Planned Enhancements */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planned Enhancements</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <Card className="group h-full hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold leading-snug">{feature.title}</CardTitle>
                        <Badge variant="outline" className="shrink-0 text-[10px] text-muted-foreground">
                          Coming Soon
                        </Badge>
                      </div>
                      <CardDescription className="text-xs leading-relaxed">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
