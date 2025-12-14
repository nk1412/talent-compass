import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { getJobs, createJob, deleteJob, matchCandidatesForJob } from '@/lib/api/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Briefcase, MapPin, Users, Trash2, Sparkles, Loader2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Jobs() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    required_skills: [] as string[],
    min_experience: 0,
    max_experience: null as number | null,
    location: '',
    employment_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    salary_min: null as number | null,
    salary_max: null as number | null,
    status: 'open'
  });
  const [skillInput, setSkillInput] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs
  });

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Job created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({ title: 'Job deleted' });
    }
  });

  const resetForm = () => {
    setNewJob({
      title: '',
      description: '',
      requirements: '',
      required_skills: [],
      min_experience: 0,
      max_experience: null,
      location: '',
      employment_type: 'full-time',
      salary_min: null,
      salary_max: null,
      status: 'open'
    });
    setSkillInput('');
  };

  const addSkill = () => {
    if (skillInput.trim() && !newJob.required_skills.includes(skillInput.trim())) {
      setNewJob(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setNewJob(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skill)
    }));
  };

  const handleMatchCandidates = async (jobId: string) => {
    setMatchingJobId(jobId);
    try {
      const result = await matchCandidatesForJob(jobId);
      setMatches(result.matches || []);
      toast({ title: `Found ${result.matches?.length || 0} matching candidates` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setMatchingJobId(null);
    }
  };

  return (
    <AppLayout title="Jobs">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground">
            {jobs?.length || 0} job postings
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
              <DialogDescription>
                Add a new job to find matching candidates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    placeholder="Senior Software Engineer"
                    value={newJob.title}
                    onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="San Francisco, CA or Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the role and responsibilities..."
                  rows={4}
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <Textarea
                  placeholder="List the requirements and qualifications..."
                  rows={3}
                  value={newJob.requirements}
                  onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newJob.required_skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select
                    value={newJob.employment_type}
                    onValueChange={(v) => setNewJob(prev => ({ ...prev, employment_type: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min Experience (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newJob.min_experience}
                    onChange={(e) => setNewJob(prev => ({ ...prev, min_experience: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Experience</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Optional"
                    value={newJob.max_experience || ''}
                    onChange={(e) => setNewJob(prev => ({ ...prev, max_experience: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salary Min ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100000"
                    value={newJob.salary_min || ''}
                    onChange={(e) => setNewJob(prev => ({ ...prev, salary_min: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary Max ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150000"
                    value={newJob.salary_max || ''}
                    onChange={(e) => setNewJob(prev => ({ ...prev, salary_max: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate(newJob)}
                disabled={!newJob.title || createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card card-hover h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || 'Not specified'}
                      </CardDescription>
                    </div>
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {(job.required_skills || []).slice(0, 4).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(job.required_skills || []).length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{job.required_skills!.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.min_experience}+ years
                    </span>
                    {job.salary_min && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {(job.salary_min / 1000).toFixed(0)}k-{job.salary_max ? `${(job.salary_max / 1000).toFixed(0)}k` : '...'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleMatchCandidates(job.id)}
                      disabled={matchingJobId === job.id}
                    >
                      {matchingJobId === job.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Match
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(job.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">No jobs yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first job posting to start matching candidates
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </motion.div>
      )}

      {/* Matches Display */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h2 className="font-heading text-xl font-semibold mb-4">Matching Candidates</h2>
          <div className="space-y-3">
            {matches.map((match, index) => (
              <div key={match.candidateId} className="glass-card rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{match.candidateName}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.reasons.join(' • ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    match.matchScore >= 70 ? 'bg-success/20 text-success' :
                    match.matchScore >= 50 ? 'bg-warning/20 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {match.matchScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4" onClick={() => setMatches([])}>
            Clear Results
          </Button>
        </motion.div>
      )}
    </AppLayout>
  );
}
