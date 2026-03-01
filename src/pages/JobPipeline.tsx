import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useJobApplications, useUpdateApplication, useSendMessage, useApplicationMessages } from '@/hooks/use-recruiter-data';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MessageSquare, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const STAGES = ['applied', 'assessment', 'ai_interview', 'recruiter_screen', 'offer'] as const;
const stageLabels: Record<string, string> = {
  applied: 'Applied', assessment: 'Assessment', ai_interview: 'AI Interview',
  recruiter_screen: 'Recruiter Screen', offer: 'Offer',
};

export default function JobPipeline() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [tab, setTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [msgText, setMsgText] = useState('');

  const { data: job } = useQuery({
    queryKey: ['job-detail', jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', jobId!).maybeSingle();
      return data;
    },
  });

  const { data: applications = [], isLoading } = useJobApplications(jobId);
  const updateApp = useUpdateApplication();
  const sendMessage = useSendMessage();
  const { data: messages = [] } = useApplicationMessages(selectedApp?.id);

  const filtered = tab === 'all' ? applications : applications.filter((a: any) => a.stage === tab);

  const handleStageMove = async (appId: string, stage: string) => {
    try {
      await updateApp.mutateAsync({ id: appId, stage });
      toast.success(`Moved to ${stageLabels[stage] || stage}`);
      if (selectedApp?.id === appId) setSelectedApp((prev: any) => ({ ...prev, stage }));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApp.mutateAsync({ id: appId, status: 'rejected' });
      toast.success('Application rejected');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleShortlist = async (appId: string) => {
    try {
      await updateApp.mutateAsync({ id: appId, status: 'shortlisted' });
      toast.success('Candidate shortlisted');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSendMsg = async () => {
    if (!msgText.trim() || !selectedApp || !user) return;
    try {
      await sendMessage.mutateAsync({
        application_id: selectedApp.id,
        sender_role: role || 'recruiter',
        sender_id: user.id,
        body: msgText.trim(),
      });
      setMsgText('');
      toast.success('Message sent');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/recruiter')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{job?.title || 'Job Pipeline'}</h1>
              <p className="text-xs text-muted-foreground capitalize">{job?.role_type} • {job?.status}</p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              {STAGES.map(s => {
                const count = applications.filter((a: any) => a.stage === s).length;
                return <TabsTrigger key={s} value={s}>{stageLabels[s]} ({count})</TabsTrigger>;
              })}
            </TabsList>

            <TabsContent value={tab}>
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-8">Loading candidates...</p>
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No candidates in this stage.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Candidate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Resume</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Assessment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Interview</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((app: any) => (
                        <tr key={app.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => setSelectedApp(app)}>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {(app.profiles as any)?.display_name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{stageLabels[app.stage] || app.stage}</Badge></td>
                          <td className="px-4 py-3">
                            <Badge variant={app.status === 'rejected' ? 'destructive' : app.status === 'shortlisted' ? 'default' : 'secondary'} className="capitalize">
                              {app.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{app.resume_score ?? '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{app.assessment_score ?? '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{app.interview_score ?? '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(app.updated_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Candidate detail drawer */}
      <Sheet open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle>{(selectedApp.profiles as any)?.display_name || 'Candidate'}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Resume', value: selectedApp.resume_score },
                    { label: 'Assessment', value: selectedApp.assessment_score },
                    { label: 'Interview', value: selectedApp.interview_score },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-bold text-foreground">{s.value ?? '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Move Stage</label>
                  <Select value={selectedApp.stage} onValueChange={(v) => handleStageMove(selectedApp.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => <SelectItem key={s} value={s}>{stageLabels[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleReject(selectedApp.id)}
                    disabled={selectedApp.status === 'rejected'}>
                    {selectedApp.status === 'rejected' ? 'Rejected' : 'Reject'}
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={() => handleShortlist(selectedApp.id)}
                    disabled={selectedApp.status === 'shortlisted'}>
                    {selectedApp.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                </div>

                {/* Messages */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Messages
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                    {messages.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No messages yet.</p>
                    ) : messages.map((m: any) => (
                      <div key={m.id} className={`rounded-lg p-2.5 text-xs ${m.sender_id === user?.id ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}>
                        <p className="text-foreground">{m.body}</p>
                        <p className="text-muted-foreground text-[10px] mt-1">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Textarea placeholder="Send a message..." value={msgText} onChange={e => setMsgText(e.target.value)}
                      className="text-xs min-h-[60px]" />
                    <Button size="sm" onClick={handleSendMsg} disabled={!msgText.trim() || sendMessage.isPending}
                      className="self-end">Send</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
