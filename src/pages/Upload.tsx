import { AppLayout } from '@/components/layout/AppLayout';
import { CVUploadZone } from '@/components/upload/CVUploadZone';
import { motion } from 'framer-motion';
import { FileText, Zap, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Automatic Parsing',
    description: 'AI extracts candidate info, skills, and experience automatically',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'All CVs are encrypted and stored securely in compliance with GDPR',
  },
  {
    icon: Clock,
    title: 'Bulk Upload',
    description: 'Upload multiple CVs at once to save time and streamline your workflow',
  },
];

export default function UploadPage() {
  return (
    <AppLayout title="Upload CVs">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">Upload Candidate CVs</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drag and drop CV files or click to browse. Our AI will automatically extract candidate information.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CVUploadZone />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-5 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
