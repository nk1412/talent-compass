import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconClassName?: string;
  delay?: number;
}

export function StatCard({ title, value, change, icon: Icon, iconClassName, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-xl p-5 card-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-heading font-bold mt-1">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-2 flex items-center gap-1',
                change.trend === 'up' && 'text-success',
                change.trend === 'down' && 'text-destructive',
                change.trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change.trend === 'up' && '↑'}
              {change.trend === 'down' && '↓'}
              {change.value}% from last week
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconClassName || 'bg-primary/10')}>
          <Icon className={cn('w-6 h-6', iconClassName ? 'text-inherit' : 'text-primary')} />
        </div>
      </div>
    </motion.div>
  );
}
