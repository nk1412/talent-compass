import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockCandidates } from '@/data/mockCandidates';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PipelineStage } from '@/types/candidate';
import { useState } from 'react';

const stages: { value: PipelineStage; label: string }[] = [
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const candidate = mockCandidates.find((c) => c.id === id);
  const [currentStage, setCurrentStage] = useState<PipelineStage>(candidate?.stage || 'screening');
  const [notes, setNotes] = useState(candidate?.notes || '');

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

  const initials = candidate.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

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
                    <h1 className="font-heading text-2xl font-bold">{candidate.fullName}</h1>
                    <p className="text-muted-foreground mt-1">
                      {candidate.employmentHistory[0]?.position} at {candidate.employmentHistory[0]?.company}
                    </p>
                  </div>
                  <StageBadge stage={candidate.stage} className="text-sm" />
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </a>
                  <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    {candidate.phone}
                  </a>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="gap-2">
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
                <TabsTrigger value="resume" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                  Resume
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Skills */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-3">Education</h3>
                  <div className="space-y-3">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{edu.degree} in {edu.field}</p>
                          <p className="text-sm text-muted-foreground">{edu.institution} • {edu.graduationYear}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs">Experience</span>
                    </div>
                    <p className="font-heading font-semibold">{candidate.totalExperience} years</p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Notice Period</span>
                    </div>
                    <p className="font-heading font-semibold">{candidate.noticePeriod || 'N/A'}</p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs">Expected</span>
                    </div>
                    <p className="font-heading font-semibold">
                      {candidate.salary?.expected ? `$${(candidate.salary.expected / 1000).toFixed(0)}k` : 'N/A'}
                    </p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Source</span>
                    </div>
                    <p className="font-heading font-semibold">{candidate.source}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="mt-6">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-heading font-semibold mb-4">Work History</h3>
                  <div className="space-y-6">
                    {candidate.employmentHistory.map((job, index) => (
                      <div key={index} className="relative pl-6 border-l-2 border-border pb-6 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <div>
                          <h4 className="font-semibold">{job.position}</h4>
                          <p className="text-muted-foreground">{job.company}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.startDate} - {job.current ? 'Present' : job.endDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resume" className="mt-6">
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold">Resume Document</h3>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Open Full Screen
                    </Button>
                  </div>
                  <div className="aspect-[8.5/11] bg-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">{candidate.resumeFileName}</p>
                      <Button variant="outline" className="mt-3 gap-2">
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
            <Select value={currentStage} onValueChange={(v) => setCurrentStage(v as PipelineStage)}>
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
              {candidate.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                </span>
              ))}
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
            <Button size="sm" className="mt-3">Save Notes</Button>
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
                  <p>Moved to Interview stage</p>
                  <p className="text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5" />
                <div>
                  <p>CV uploaded</p>
                  <p className="text-muted-foreground">5 days ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
