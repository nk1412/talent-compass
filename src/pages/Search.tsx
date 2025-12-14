import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCandidates } from '@/hooks/useCandidates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const allSkills = [
  'React', 'TypeScript', 'Python', 'Node.js', 'AWS', 'Java', 'Machine Learning',
  'PostgreSQL', 'GraphQL', 'Docker', 'Kubernetes', 'Swift', 'Go'
];

export default function SearchPage() {
  const { data: candidates, isLoading } = useCandidates();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experienceRange, setExperienceRange] = useState([0, 15]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const filteredCandidates = useMemo(() => {
    if (!hasSearched || !candidates) return [];

    return candidates.filter((candidate) => {
      // Keyword search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const employmentHistory = (candidate.employment_history as Array<{ company?: string; position?: string }>) || [];
        const matchesSearch =
          candidate.full_name.toLowerCase().includes(query) ||
          candidate.skills?.some((s) => s.toLowerCase().includes(query)) ||
          employmentHistory.some(e => 
            e.company?.toLowerCase().includes(query) ||
            e.position?.toLowerCase().includes(query)
          );
        if (!matchesSearch) return false;
      }

      // Experience filter
      const exp = candidate.total_experience || 0;
      if (exp < experienceRange[0] || exp > experienceRange[1]) {
        return false;
      }

      // Skills filter
      if (selectedSkills.length > 0) {
        const hasRequiredSkills = selectedSkills.some(skill => 
          candidate.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        if (!hasRequiredSkills) return false;
      }

      return true;
    });
  }, [candidates, searchQuery, experienceRange, selectedSkills, hasSearched]);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearAll = () => {
    setSearchQuery('');
    setJobDescription('');
    setExperienceRange([0, 15]);
    setSelectedSkills([]);
    setHasSearched(false);
  };

  if (isLoading) {
    return (
      <AppLayout title="Search Candidates">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Search Candidates">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2 mb-6">
              <Label>Keywords</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Skills, job titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Experience Range */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Label>Experience (years)</Label>
                <span className="text-sm text-muted-foreground">
                  {experienceRange[0]} - {experienceRange[1]}+
                </span>
              </div>
              <Slider
                value={experienceRange}
                onValueChange={setExperienceRange}
                min={0}
                max={15}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label>Skills</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allSkills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <label
                      htmlFor={skill}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Matching */}
          <div className="glass-card rounded-xl p-5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold">AI Matching</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Paste a job description to find the best matching candidates
            </p>
            <Textarea
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="resize-none mb-3"
            />
            <Button className="w-full gap-2" disabled={!jobDescription}>
              <Sparkles className="w-4 h-4" />
              Find Matches
            </Button>
          </div>

          <Button onClick={handleSearch} className="w-full" size="lg">
            <Search className="w-4 h-4 mr-2" />
            Search Candidates
          </Button>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!hasSearched ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Start your search</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Use the filters on the left to find candidates that match your requirements, or paste a job description for AI-powered matching.
              </p>
            </motion.div>
          ) : filteredCandidates.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{filteredCandidates.length}</span> matching candidates
                </p>
              </div>
              <div className="space-y-3">
                {filteredCandidates.map((candidate, index) => (
                  <CandidateCard key={candidate.id} candidate={candidate} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria
              </p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
