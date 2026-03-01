import { Application, Stage } from '@/lib/types';
import { TimelineStepper } from './TimelineStepper';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: Application;
}

const stageCTAMap: Record<Stage, string> = {
  applied: 'View Details',
  assessment: 'Start Assessment',
  'ai-interview': 'Prep Interview',
  'recruiter-screen': 'Prepare Notes',
  offer: 'View Offer',
  rejected: 'View Feedback',
};

const stageBadgeMap: Record<Stage, string> = {
  applied: 'bg-stage-applied/15 text-stage-applied',
  assessment: 'bg-stage-assessment/15 text-stage-assessment',
  'ai-interview': 'bg-stage-interview/15 text-stage-interview',
  'recruiter-screen': 'bg-stage-screen/15 text-stage-screen',
  offer: 'bg-stage-offer/15 text-stage-offer',
  rejected: 'bg-stage-rejected/15 text-stage-rejected',
};

const stageLabel: Record<Stage, string> = {
  applied: 'Applied',
  assessment: 'Assessment',
  'ai-interview': 'AI Interview',
  'recruiter-screen': 'Recruiter Screen',
  offer: 'Offer',
  rejected: 'Rejected',
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link
      to={`/application/${application.id}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:glow-primary-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {application.role}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{application.company}</p>
        </div>
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', stageBadgeMap[application.stage])}>
          {stageLabel[application.stage]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {application.location}
        </span>
        {application.deadlines[0] && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {application.deadlines[0].date}
          </span>
        )}
      </div>

      <div className="mb-4">
        <TimelineStepper steps={application.timeline} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
          {stageCTAMap[application.stage]}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}