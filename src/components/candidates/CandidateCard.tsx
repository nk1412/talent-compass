import { StageBadge } from '@/components/ui/stage-badge';
import { MapPin, Briefcase, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';

type CandidateRow = Database['public']['Tables']['candidates']['Row'];

interface CandidateCardProps {
  candidate: CandidateRow;
  index: number;
}

export function CandidateCard({ candidate, index }: CandidateCardProps) {
  const initials = candidate.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const employmentHistory = (candidate.employment_history as Array<{ company?: string; position?: string }>) || [];
  const currentJob = employmentHistory[0];
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/candidates/${candidate.id}`}
        className="block glass-card rounded-xl p-5 card-hover group"
      >
        {/* Avatar */}

        {/* Main Info */}
        {isMobile ? (
          <div className="flex flex-col items-start gap-4">
            <div className='flex items-center justify-between w-full'>
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                {initials}
              </div>
              {candidate.stage && <StageBadge stage={candidate.stage} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                    {candidate.full_name}
                  </h3>
                  {currentJob && (
                    <p className="text-muted-foreground text-sm">
                      {currentJob.position} at {currentJob.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {candidate.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </span>
                )}
                {candidate.total_experience !== null && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {candidate.total_experience}
                  </span>
                )}
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {candidate.skills.slice(0, 7).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 7 && (
                    <span className="px-2 py-0.5 text-muted-foreground text-xs">
                      +{candidate.skills.length - 7} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex items-start gap-4'>
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                    {candidate.full_name}
                  </h3>
                  {currentJob && (
                    <p className="text-muted-foreground text-sm">
                      {currentJob.position} at {currentJob.company}
                    </p>
                  )}
                </div>
                {candidate.stage && <StageBadge stage={candidate.stage} />}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {candidate.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </span>
                )}
                {candidate.total_experience !== null && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {candidate.total_experience}
                  </span>
                )}
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {candidate.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 5 && (
                    <span className="px-2 py-0.5 text-muted-foreground text-xs">
                      +{candidate.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Quick Actions */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
          <a
            href={`mailto:${candidate.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">{candidate.email}</span>
          </a>
          {candidate.phone && (
            <a
              href={`tel:${candidate.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{candidate.phone}</span>
            </a>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
