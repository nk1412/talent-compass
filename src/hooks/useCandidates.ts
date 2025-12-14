import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate } from '@/lib/api/candidates';
import type { Database } from '@/integrations/supabase/types';

type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: getCandidates,
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: () => getCandidate(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (candidate: CandidateInsert) => createCandidate(candidate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CandidateUpdate }) => 
      updateCandidate(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', id] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

// Dashboard stats computed from candidates
export function useDashboardStats(candidates: CandidateRow[] | undefined) {
  if (!candidates) {
    return {
      totalCandidates: 0,
      newThisWeek: 0,
      inPipeline: 0,
      hired: 0,
      topSkills: [],
      stageBreakdown: [],
    };
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const newThisWeek = candidates.filter(
    (c) => new Date(c.created_at) >= oneWeekAgo
  ).length;

  const inPipeline = candidates.filter(
    (c) => c.stage && !['hired', 'rejected'].includes(c.stage)
  ).length;

  const hired = candidates.filter((c) => c.stage === 'hired').length;

  // Calculate top skills
  const skillCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    c.skills?.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate stage breakdown
  const stageCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    const stage = c.stage || 'screening';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });
  const stageBreakdown = Object.entries(stageCounts).map(([stage, count]) => ({
    stage: stage as Database['public']['Enums']['pipeline_stage'],
    count,
  }));

  return {
    totalCandidates: candidates.length,
    newThisWeek,
    inPipeline,
    hired,
    topSkills,
    stageBreakdown,
  };
}
