import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { useCandidates } from '@/hooks/useCandidates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type PipelineStage = Database['public']['Enums']['pipeline_stage'];

const stages: { value: PipelineStage | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const experienceRanges = [
  { value: 'all', label: 'All Experience' },
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' },
];

export default function Candidates() {
  const { data: candidates, isLoading } = useCandidates();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    
    return candidates.filter((candidate) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          candidate.full_name.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query) ||
          candidate.skills?.some((s) => s.toLowerCase().includes(query)) ||
          candidate.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Stage filter
      if (stageFilter !== 'all' && candidate.stage !== stageFilter) {
        return false;
      }

      // Experience filter
      if (experienceFilter !== 'all') {
        const exp = candidate.total_experience || 0;
        switch (experienceFilter) {
          case '0-2':
            if (exp > 2) return false;
            break;
          case '3-5':
            if (exp < 3 || exp > 5) return false;
            break;
          case '6-10':
            if (exp < 6 || exp > 10) return false;
            break;
          case '10+':
            if (exp < 10) return false;
            break;
        }
      }

      return true;
    });
  }, [candidates, searchQuery, stageFilter, experienceFilter]);

  const activeFiltersCount = [
    stageFilter !== 'all',
    experienceFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStageFilter('all');
    setExperienceFilter('all');
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <AppLayout title="Candidates">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Candidates">
      {/* Search & Filters Bar */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, skills, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary-foreground/20 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Stage</label>
                  <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as PipelineStage | 'all')}>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Experience</label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCandidates.length}</span> candidates
        </p>
      </div>

      {/* Candidates List */}
      {filteredCandidates.length > 0 ? (
        <div className="space-y-3">
          {filteredCandidates.map((candidate, index) => (
            <CandidateCard key={candidate.id} candidate={candidate} index={index} />
          ))}
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
          <h3 className="font-heading text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        </motion.div>
      )}
    </AppLayout>
  );
}
