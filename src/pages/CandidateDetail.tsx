import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCandidate, useUpdateCandidate } from '@/hooks/useCandidates';
import { StageBadge } from '@/components/ui/stage-badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Loader2,
  FolderKanban,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getResumeUrl } from '@/lib/api/candidates';
import type { Database } from '@/integrations/supabase/types';

type PipelineStage = Database['public']['Enums']['pipeline_stage'];

const stages: { value: PipelineStage; label: string }[] = [
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  graduationYear?: number;
}

interface Projects {
  name?: string;
  description?: string;
  link?: string;
  tools?: string[];
}

interface Employment {
  company?: string;
  role?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  roleSummary?: string;
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: candidate, isLoading } = useCandidate(id || '');
  const updateCandidate = useUpdateCandidate();
  const { toast } = useToast();

  const [currentStage, setCurrentStage] = useState<PipelineStage>('screening');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (candidate) {
      setCurrentStage(candidate.stage || 'screening');
      setNotes(candidate.notes || '');
    }
  }, [candidate]);

  const handleStageChange = async (newStage: PipelineStage) => {
    if (!id) return;
    setCurrentStage(newStage);
    try {
      await updateCandidate.mutateAsync({ id, updates: { stage: newStage } });
      toast({ title: 'Stage updated successfully' });
    } catch {
      toast({ title: 'Failed to update stage', variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await updateCandidate.mutateAsync({ id, updates: { notes } });
      toast({ title: 'Notes saved successfully' });
    } catch {
      toast({ title: 'Failed to save notes', variant: 'destructive' });
    }
  };

  const handleDownloadResume = async () => {
    if (!candidate?.resume_file_path) return;
    try {
      const url = await getResumeUrl(candidate.resume_file_path);
      if (url) window.open(url, '_blank');
    } catch {
      toast({ title: 'Failed to download resume', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Candidate Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!candidate) {
    return (
      <AppLayout title="Candidate Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-heading font-semibold mb-2">Candidate not found</h2>
          <Link to="/candidates">
            <Button variant="outline">Back to Candidates</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const initials = candidate.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const education = (candidate.education as Education[]) || [];
  const employmentHistory = (candidate.employment_history as Employment[]) || [];
  const projects = (candidate.projects as Projects[]) || [];
  const currentJob = employmentHistory[0];
  const skills = candidate.skills || [];
  const tags = candidate.tags || [];

  return (
    <AppLayout title="Candidate Profile">
      {/* Back button */}
      <Link to="/candidates" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-heading text-2xl font-bold">{candidate.full_name}</h1>
                    {currentJob && (
                      <p className="text-muted-foreground mt-1">
                        {currentJob.role} at {currentJob.company}
                      </p>
                    )}
                  </div>
                  {candidate.stage && <StageBadge stage={candidate.stage} className="text-sm" />}
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </a>
                  {candidate.phone && (
                    <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </a>
                  )}
                  {candidate.location && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleDownloadResume} disabled={!candidate.resume_file_path}>
                    <Download className="w-4 h-4" />
                    Download CV
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                  Experience
                </TabsTrigger>
                <TabsTrigger value="projects" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                  Projects
                </TabsTrigger>
                <TabsTrigger value="resume" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                  Resume
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Skills */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    )) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-3">Education</h3>
                  <div className="space-y-3">
                    {education.length > 0 ? education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{edu.degree} in {edu.field}</p>
                          <p className="text-sm text-muted-foreground">{edu.institution} • {edu.graduationYear}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">No education listed</p>
                    )}
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs">Experience</span>
                    </div>
                    <p className="font-heading font-semibold">{candidate.total_experience || 0} years</p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Notice Period</span>
                    </div>
                    <p className="font-heading font-semibold">{candidate.notice_period || 'N/A'}</p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs">Expected</span>
                    </div>
                    <p className="font-heading font-semibold">
                      {candidate.expected_salary ? `$${(candidate.expected_salary / 1000).toFixed(0)}k` : 'N/A'}
                    </p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Source</span>
                    </div>
                    <p className="font-heading font-semibold">{candidate.source || 'N/A'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="mt-6">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-4">Work History</h3>
                  <div className="space-y-6">
                    {employmentHistory.length > 0 ? employmentHistory.map((job, index) => (
                      <div key={index} className="relative pl-6 border-l-2 border-border pb-6 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <div>
                          <h4 className="font-semibold">{job.role}</h4>
                          <p className="text-muted-foreground">{job.company}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.startDate} - {job.current ? 'Present' : job.endDate}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">No work history listed</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-4">Projects</h3>
                  {projects && projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.name} className="p-4 bg-secondary/50 rounded-lg" onClick={() => window.open(project.link, "_blank", "noopener,noreferrer")}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FolderKanban className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{project.name}</h4>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                )}
                                {project.tools && project?.tools?.length > 0 && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                                    <div className="flex flex-wrap gap-1.5">
                                      {project?.tools?.map((tool) => (
                                        <span key={tool} className="px-3 py-1.5 bg-primary/10 text-primary rounded text-xs font-medium">
                                          {tool}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {project.link && (
                              <div
                                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No projects listed</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="resume" className="mt-6">
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold">Resume Document</h3>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadResume} disabled={!candidate.resume_file_path}>
                      <ExternalLink className="w-4 h-4" />
                      Open Full Screen
                    </Button>
                  </div>
                  <div className="aspect-[8.5/11] bg-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">{candidate.resume_file_name || 'No resume uploaded'}</p>
                      <Button variant="outline" className="mt-3 gap-2" onClick={handleDownloadResume} disabled={!candidate.resume_file_path}>
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stage Update */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold mb-3">Pipeline Stage</h3>
            <Select value={currentStage} onValueChange={(v) => handleStageChange(v as PipelineStage)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold">Tags</h3>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                </span>
              )) : (
                <p className="text-sm text-muted-foreground">No tags</p>
              )}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold mb-3">Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this candidate..."
              rows={4}
              className="resize-none"
            />
            <Button size="sm" className="mt-3" onClick={handleSaveNotes} disabled={updateCandidate.isPending}>
              {updateCandidate.isPending ? 'Saving...' : 'Save Notes'}
            </Button>
          </motion.div>

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold mb-3">Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div>
                  <p>Profile created</p>
                  <p className="text-muted-foreground">{new Date(candidate.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
