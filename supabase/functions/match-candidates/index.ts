import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Candidate {
  id: string;
  full_name: string;
  skills: string[];
  total_experience: number;
  location: string;
}

interface Job {
  id: string;
  title: string;
  required_skills: string[];
  min_experience: number;
  max_experience: number | null;
  location: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job, candidates } = await req.json() as { job: Job; candidates: Candidate[] };

    if (!job || !candidates || !Array.isArray(candidates)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: job and candidates array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Matching ${candidates.length} candidates for job: ${job.title}`);

    const matchedCandidates = candidates.map(candidate => {
      let score = 0;
      const reasons: string[] = [];

      // Skills matching (50% weight)
      const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
      const requiredSkillsLower = job.required_skills.map(s => s.toLowerCase());
      
      const matchedSkills = requiredSkillsLower.filter(skill => 
        candidateSkillsLower.some(cs => cs.includes(skill) || skill.includes(cs))
      );
      
      const skillsScore = requiredSkillsLower.length > 0 
        ? (matchedSkills.length / requiredSkillsLower.length) * 50 
        : 25;
      score += skillsScore;

      if (matchedSkills.length > 0) {
        reasons.push(`Matches ${matchedSkills.length}/${job.required_skills.length} required skills`);
      }

      // Experience matching (30% weight)
      const meetsMinExp = candidate.total_experience >= job.min_experience;
      const meetsMaxExp = !job.max_experience || candidate.total_experience <= job.max_experience;
      
      if (meetsMinExp && meetsMaxExp) {
        score += 30;
        reasons.push(`${candidate.total_experience} years experience meets requirements`);
      } else if (meetsMinExp) {
        score += 20;
        reasons.push(`Exceeds experience range but qualified`);
      } else {
        const expDiff = job.min_experience - candidate.total_experience;
        if (expDiff <= 2) {
          score += 15;
          reasons.push(`${expDiff} years below minimum, but close`);
        }
      }

      // Location matching (20% weight)
      if (job.location && candidate.location) {
        const jobLocLower = job.location.toLowerCase();
        const candLocLower = candidate.location.toLowerCase();
        
        if (candLocLower.includes(jobLocLower) || jobLocLower.includes(candLocLower)) {
          score += 20;
          reasons.push('Location match');
        } else if (jobLocLower.includes('remote') || candLocLower.includes('remote')) {
          score += 15;
          reasons.push('Remote work possible');
        }
      } else {
        score += 10; // Neutral if no location specified
      }

      return {
        candidateId: candidate.id,
        candidateName: candidate.full_name,
        matchScore: Math.round(score),
        reasons
      };
    });

    // Sort by match score descending
    matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Matched candidates. Top score: ${matchedCandidates[0]?.matchScore || 0}`);

    return new Response(
      JSON.stringify({ success: true, matches: matchedCandidates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error matching candidates:', error);
    const message = error instanceof Error ? error.message : 'Failed to match candidates';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
