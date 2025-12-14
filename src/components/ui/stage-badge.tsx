import { cn } from '@/lib/utils';
import { PipelineStage } from '@/types/candidate';

const stageConfig: Record<PipelineStage, { label: string; className: string }> = {
  screening: {
    label: 'Screening',
    className: 'bg-stage-screening/20 text-stage-screening border-stage-screening/30',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-stage-shortlisted/20 text-stage-shortlisted border-stage-shortlisted/30',
  },
  interview: {
    label: 'Interview',
    className: 'bg-stage-interview/20 text-stage-interview border-stage-interview/30',
  },
  offer: {
    label: 'Offer',
    className: 'bg-stage-offer/20 text-stage-offer border-stage-offer/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-stage-rejected/20 text-stage-rejected border-stage-rejected/30',
  },
  hired: {
    label: 'Hired',
    className: 'bg-stage-hired/20 text-stage-hired border-stage-hired/30',
  },
};

interface StageBadgeProps {
  stage: PipelineStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = stageConfig[stage];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
