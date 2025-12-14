import { Candidate, DashboardStats, PipelineStage } from '@/types/candidate';

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    fullName: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    totalExperience: 7,
    relevantExperience: 5,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'GraphQL'],
    education: [
      { institution: 'Stanford University', degree: 'MS', field: 'Computer Science', graduationYear: 2017 }
    ],
    employmentHistory: [
      { company: 'Meta', position: 'Senior Software Engineer', startDate: '2021-03', current: true },
      { company: 'Stripe', position: 'Software Engineer', startDate: '2018-06', endDate: '2021-02', current: false }
    ],
    resumeFilePath: '/resumes/sarah-chen.pdf',
    resumeFileName: 'sarah-chen-resume.pdf',
    parsedResumeText: 'Senior software engineer with 7 years of experience...',
    source: 'LinkedIn',
    notes: 'Strong technical background, excellent communication skills',
    stage: 'interview',
    tags: ['senior', 'frontend', 'remote-ok'],
    salary: { current: 180000, expected: 220000 },
    noticePeriod: '2 weeks',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: '2',
    fullName: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    phone: '+1 (555) 234-5678',
    location: 'Austin, TX',
    totalExperience: 4,
    relevantExperience: 3,
    skills: ['Python', 'Django', 'Machine Learning', 'TensorFlow', 'SQL'],
    education: [
      { institution: 'MIT', degree: 'BS', field: 'Computer Science', graduationYear: 2020 }
    ],
    employmentHistory: [
      { company: 'Tesla', position: 'ML Engineer', startDate: '2022-01', current: true },
      { company: 'IBM', position: 'Data Scientist', startDate: '2020-07', endDate: '2021-12', current: false }
    ],
    resumeFilePath: '/resumes/marcus-johnson.pdf',
    resumeFileName: 'marcus-johnson-cv.pdf',
    parsedResumeText: 'Machine learning engineer specializing in...',
    source: 'Referral',
    notes: 'Referred by John D. Great ML expertise.',
    stage: 'shortlisted',
    tags: ['ml', 'python', 'mid-level'],
    salary: { current: 140000, expected: 170000 },
    noticePeriod: '1 month',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z'
  },
  {
    id: '3',
    fullName: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1 (555) 345-6789',
    location: 'New York, NY',
    totalExperience: 10,
    relevantExperience: 8,
    skills: ['Product Management', 'Agile', 'SQL', 'Data Analysis', 'Jira', 'Figma'],
    education: [
      { institution: 'Columbia University', degree: 'MBA', field: 'Business Administration', graduationYear: 2014 }
    ],
    employmentHistory: [
      { company: 'Google', position: 'Senior Product Manager', startDate: '2019-05', current: true },
      { company: 'Amazon', position: 'Product Manager', startDate: '2015-08', endDate: '2019-04', current: false }
    ],
    resumeFilePath: '/resumes/emily-rodriguez.pdf',
    resumeFileName: 'emily-rodriguez-resume.pdf',
    parsedResumeText: 'Experienced product manager with track record...',
    source: 'Job Board',
    notes: 'Excellent leadership experience, FAANG background',
    stage: 'offer',
    tags: ['senior', 'product', 'leadership'],
    salary: { current: 200000, expected: 250000 },
    noticePeriod: '2 weeks',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z'
  },
  {
    id: '4',
    fullName: 'James Park',
    email: 'james.park@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    totalExperience: 2,
    relevantExperience: 2,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
    education: [
      { institution: 'University of Washington', degree: 'BS', field: 'Computer Science', graduationYear: 2022 }
    ],
    employmentHistory: [
      { company: 'Startup XYZ', position: 'Frontend Developer', startDate: '2022-08', current: true }
    ],
    resumeFilePath: '/resumes/james-park.pdf',
    resumeFileName: 'james-park-cv.pdf',
    parsedResumeText: 'Junior frontend developer eager to learn...',
    source: 'Career Fair',
    notes: 'Shows great potential, eager to learn',
    stage: 'screening',
    tags: ['junior', 'frontend'],
    salary: { expected: 90000 },
    noticePeriod: '2 weeks',
    createdAt: '2024-01-18T12:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z'
  },
  {
    id: '5',
    fullName: 'Aisha Patel',
    email: 'aisha.patel@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Chicago, IL',
    totalExperience: 6,
    relevantExperience: 4,
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker', 'Microservices', 'AWS'],
    education: [
      { institution: 'Georgia Tech', degree: 'MS', field: 'Software Engineering', graduationYear: 2018 }
    ],
    employmentHistory: [
      { company: 'Netflix', position: 'Backend Engineer', startDate: '2020-03', current: true },
      { company: 'Oracle', position: 'Software Developer', startDate: '2018-07', endDate: '2020-02', current: false }
    ],
    resumeFilePath: '/resumes/aisha-patel.pdf',
    resumeFileName: 'aisha-patel-resume.pdf',
    parsedResumeText: 'Backend engineer with expertise in distributed systems...',
    source: 'LinkedIn',
    notes: 'Strong backend skills, microservices expert',
    stage: 'interview',
    tags: ['backend', 'senior', 'distributed-systems'],
    salary: { current: 170000, expected: 200000 },
    noticePeriod: '3 weeks',
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z'
  },
  {
    id: '6',
    fullName: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 678-9012',
    location: 'Los Angeles, CA',
    totalExperience: 8,
    relevantExperience: 6,
    skills: ['iOS', 'Swift', 'Objective-C', 'SwiftUI', 'CoreData'],
    education: [
      { institution: 'UCLA', degree: 'BS', field: 'Computer Science', graduationYear: 2016 }
    ],
    employmentHistory: [
      { company: 'Apple', position: 'iOS Engineer', startDate: '2019-01', current: true },
      { company: 'Uber', position: 'Mobile Developer', startDate: '2016-08', endDate: '2018-12', current: false }
    ],
    resumeFilePath: '/resumes/david-kim.pdf',
    resumeFileName: 'david-kim-cv.pdf',
    parsedResumeText: 'iOS engineer with deep expertise in Apple ecosystem...',
    source: 'Referral',
    notes: 'Exceptional mobile development skills',
    stage: 'hired',
    tags: ['mobile', 'ios', 'senior'],
    salary: { current: 190000, expected: 220000 },
    noticePeriod: '2 weeks',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-12T15:00:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalCandidates: 1247,
  newThisWeek: 48,
  inPipeline: 156,
  hired: 23,
  topSkills: [
    { skill: 'React', count: 324 },
    { skill: 'Python', count: 287 },
    { skill: 'TypeScript', count: 256 },
    { skill: 'AWS', count: 198 },
    { skill: 'Node.js', count: 176 }
  ],
  stageBreakdown: [
    { stage: 'screening', count: 67 },
    { stage: 'shortlisted', count: 42 },
    { stage: 'interview', count: 31 },
    { stage: 'offer', count: 16 },
    { stage: 'hired', count: 23 },
    { stage: 'rejected', count: 45 }
  ]
};
