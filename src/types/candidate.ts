export type PipelineStage = 
  | 'screening' 
  | 'shortlisted' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'hired';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export interface Employment {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  totalExperience: number;
  relevantExperience: number;
  skills: string[];
  education: Education[];
  employmentHistory: Employment[];
  resumeFilePath: string;
  resumeFileName: string;
  parsedResumeText: string;
  source: string;
  notes: string;
  stage: PipelineStage;
  tags: string[];
  salary?: {
    current?: number;
    expected?: number;
  };
  noticePeriod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCandidates: number;
  newThisWeek: number;
  inPipeline: number;
  hired: number;
  topSkills: { skill: string; count: number }[];
  stageBreakdown: { stage: PipelineStage; count: number }[];
}
