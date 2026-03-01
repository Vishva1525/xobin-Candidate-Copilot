import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage } from '@/lib/types';
import { useApplications } from '@/hooks/use-applications';
import { toast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowRight, FileText } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateApplicationWizard({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState<Stage>('applied');
  const [deadline, setDeadline] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const { addApplication } = useApplications();
  const navigate = useNavigate();

  const reset = () => {
    setStep(1);
    setRole('');
    setCompany('');
    setLocation('');
    setStage('applied');
    setDeadline('');
    setJobDescription('');
  };

  const handleCreate = () => {
    addApplication({
      role,
      company,
      location,
      stage,
      jobDescription,
      deadlineLabel: deadline ? 'Deadline' : undefined,
      deadlineDate: deadline || undefined,
    });

    toast({
      title: 'Application added — tracking started.',
      description: `${role} at ${company || 'Unknown Company'}`,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? 'Role Details' : 'Resume (Optional)'}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Tell us about the position you applied to.'
              : 'Add a resume to unlock AI tailoring and prep tools.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="role">Role title *</Label>
              <Input
                id="role"
                placeholder="e.g., Data Analyst"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="e.g., Acme Inc."
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Remote"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Stage</Label>
                <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="ai-interview">AI Interview</SelectItem>
                    <SelectItem value="recruiter-screen">Recruiter Screen</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="jd">Job description</Label>
              <Textarea
                id="jd"
                placeholder="Paste the job description here for better AI tailoring..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!role.trim()}
              className="w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Upload or paste your resume in Resume Lab for AI-powered tailoring.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCreate}
              >
                Skip for now
              </Button>
              <Button
                onClick={() => {
                  handleCreate();
                  navigate('/resume-lab');
                }}
              >
                Go to Resume Lab
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
