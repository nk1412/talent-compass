import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/stat-card';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { mockCandidates, mockDashboardStats } from '@/data/mockCandidates';
import { Users, UserPlus, GitBranch, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PipelineStage } from '@/types/candidate';

const stageColors: Record<PipelineStage, string> = {
  screening: 'bg-stage-screening',
  shortlisted: 'bg-stage-shortlisted',
  interview: 'bg-stage-interview',
  offer: 'bg-stage-offer',
  rejected: 'bg-stage-rejected',
  hired: 'bg-stage-hired',
};

export default function Dashboard() {
  const recentCandidates = mockCandidates.slice(0, 4);
  const stats = mockDashboardStats;

  return (
    <AppLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates.toLocaleString()}
          change={{ value: 12, trend: 'up' }}
          icon={Users}
          delay={0}
        />
        <StatCard
          title="New This Week"
          value={stats.newThisWeek}
          change={{ value: 8, trend: 'up' }}
          icon={UserPlus}
          iconClassName="bg-info/10 text-info"
          delay={0.1}
        />
        <StatCard
          title="In Pipeline"
          value={stats.inPipeline}
          change={{ value: 3, trend: 'down' }}
          icon={GitBranch}
          iconClassName="bg-warning/10 text-warning"
          delay={0.2}
        />
        <StatCard
          title="Hired This Month"
          value={stats.hired}
          change={{ value: 15, trend: 'up' }}
          icon={CheckCircle}
          iconClassName="bg-success/10 text-success"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Recent Candidates</h2>
            <Link to="/candidates">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentCandidates.map((candidate, index) => (
              <CandidateCard key={candidate.id} candidate={candidate} index={index} />
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Pipeline Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold mb-4">Pipeline Overview</h3>
            <div className="space-y-3">
              {stats.stageBreakdown.map((item) => {
                const total = stats.stageBreakdown.reduce((acc, s) => acc + s.count, 0);
                const percentage = (item.count / total) * 100;
                return (
                  <div key={item.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{item.stage}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className={`h-full rounded-full ${stageColors[item.stage]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">Top Skills</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {stats.topSkills.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{skill.skill}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{skill.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/upload" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Upload CVs
                </Button>
              </Link>
              <Link to="/search" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Search Candidates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
