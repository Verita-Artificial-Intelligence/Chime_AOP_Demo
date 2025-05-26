// Custom data for the Partner Manager ACE Deal Registration workflow

export const unregisteredOpportunities = [
  {
    id: 'OPP-1001',
    name: 'Acme Cloud Migration',
    description: 'Enterprise-wide cloud migration to AWS and implementation of new data storage architecture',
    customer: 'Acme Corp',
    value: 450000,
    awsValue: 195000,
    stage: 'Discovery',
    closeDate: '2025-08-15',
    owner: 'Sarah Johnson',
    region: 'Americas',
    lastModified: '2025-04-22',
    requiredACEFields: {
      complete: false,
      missing: ['AWS Account ID', 'AWS Services List', 'AWS Account Manager']
    }
  },
  {
    id: 'OPP-1004',
    name: 'FinTech Security Upgrade',
    description: 'Implementation of enhanced security protocols and compliance monitoring',
    customer: 'AlphaBank',
    value: 380000,
    awsValue: 165000,
    stage: 'Discovery',
    closeDate: '2025-09-15',
    owner: 'David Rodriguez',
    region: 'EMEA',
    lastModified: '2025-04-26',
    requiredACEFields: {
      complete: true,
      missing: []
    }
  },
  {
    id: 'OPP-1005',
    name: 'MediCorp Patient Platform',
    description: 'Patient engagement platform with telehealth capabilities',
    customer: 'MediCorp',
    value: 620000,
    awsValue: 310000,
    stage: 'Discovery',
    closeDate: '2025-10-30',
    owner: 'Thomas Wilson',
    region: 'Americas',
    lastModified: '2025-04-27',
    requiredACEFields: {
      complete: false,
      missing: ['AWS Services List']
    }
  }
];

export const awsAccountManagers = [
  {
    id: 'AWS-AM-001',
    name: 'Emily Zhang',
    email: 'emily.zhang@aws.example.com',
    region: 'Americas',
    expertise: ['Migration', 'Security', 'Enterprise'],
    responseTime: 'High',
    lastContactDate: '2025-04-28'
  },
  {
    id: 'AWS-AM-002',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@aws.example.com',
    region: 'Americas',
    expertise: ['Analytics', 'Machine Learning', 'Retail'],
    responseTime: 'Medium',
    lastContactDate: '2025-04-25'
  },
  {
    id: 'AWS-AM-003',
    name: 'Sophia Williams',
    email: 'sophia.williams@aws.example.com',
    region: 'EMEA',
    expertise: ['Financial Services', 'Security', 'Compliance'],
    responseTime: 'High',
    lastContactDate: '2025-04-26'
  }
];

export const awsServices = [
  { name: 'Amazon EC2', category: 'Compute', popular: true },
  { name: 'Amazon S3', category: 'Storage', popular: true },
  { name: 'Amazon RDS', category: 'Database', popular: true },
  { name: 'AWS Lambda', category: 'Compute', popular: true },
  { name: 'Amazon DynamoDB', category: 'Database', popular: true },
  { name: 'Amazon Redshift', category: 'Analytics', popular: true },
  { name: 'Amazon CloudFront', category: 'Networking', popular: true },
  { name: 'Amazon SNS', category: 'Messaging', popular: false },
  { name: 'Amazon SQS', category: 'Messaging', popular: false },
  { name: 'AWS Glue', category: 'Analytics', popular: false },
  { name: 'Amazon Kinesis', category: 'Analytics', popular: false },
  { name: 'Amazon Cognito', category: 'Security', popular: false },
  { name: 'AWS IAM', category: 'Security', popular: true },
  { name: 'AWS WAF', category: 'Security', popular: false },
  { name: 'AWS Shield', category: 'Security', popular: false },
  { name: 'Amazon Connect', category: 'Business Apps', popular: false },
  { name: 'Amazon Comprehend', category: 'Machine Learning', popular: false },
  { name: 'Amazon SageMaker', category: 'Machine Learning', popular: true },
  { name: 'AWS Step Functions', category: 'Integration', popular: false },
  { name: 'Amazon EventBridge', category: 'Integration', popular: false }
];

export const registrationHistory = [
  {
    id: 'ACE-4001',
    opportunityId: 'OPP-1002',
    status: 'Registered',
    registrationDate: '2025-04-19',
    registeredBy: 'Michael Williams',
    awsAccountManager: 'Emily Zhang',
    estimatedAwsRevenue: 120000,
    services: ['AWS Lambda', 'AWS IAM', 'Amazon Cognito'],
    lastUpdated: '2025-04-19'
  },
  {
    id: 'ACE-4002',
    opportunityId: 'OPP-1003',
    status: 'Approved',
    registrationDate: '2025-04-15',
    registeredBy: 'Jessica Lee',
    awsAccountManager: 'Marcus Johnson',
    estimatedAwsRevenue: 210000,
    services: ['Amazon Kinesis', 'AWS Glue', 'Amazon QuickSight'],
    lastUpdated: '2025-04-17'
  }
];

export const registrationMetrics = {
  totalRegistrations: 12,
  currentQuarter: {
    registered: 5,
    pending: 2,
    approved: 3,
    rejected: 0,
    totalValue: 1250000,
    estimatedAwsRevenue: 540000
  },
  previousQuarter: {
    registered: 7,
    pending: 0,
    approved: 6,
    rejected: 1,
    totalValue: 1750000,
    estimatedAwsRevenue: 680000
  },
  trendsThisQuarter: {
    registrationGrowth: 0.15, // 15% increase from previous quarter
    approvalRate: 0.85, // 85% of registrations get approved
    avgProcessingTime: 3.2 // 3.2 days
  }
};