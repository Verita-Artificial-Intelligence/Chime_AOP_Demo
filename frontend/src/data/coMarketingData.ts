// Custom data for the Co-Marketing Opportunities workflow

export const partnerData = [
  {
    id: 'PTR-001',
    name: 'TechConsult Partners',
    tier: 'Premier',
    specialization: 'Systems Integration',
    marketingFund: 75000,
    fundUtilization: 0.35,
    marketingContacts: [
      {
        name: 'Jennifer Martinez',
        role: 'Marketing Director',
        email: 'jennifer.martinez@techconsult.com',
        phone: '555-123-7890'
      },
      {
        name: 'Alex Thompson',
        role: 'Content Marketing Manager',
        email: 'alex.thompson@techconsult.com',
        phone: '555-123-7891'
      }
    ],
    previousCampaigns: [
      {
        name: 'Cloud Migration Summit',
        type: 'Webinar Series',
        date: '2025-02-15',
        leads: 145,
        conversionRate: 0.12,
        revenueGenerated: 250000
      },
      {
        name: 'Digital Transformation Workshop',
        type: 'In-person Event',
        date: '2025-01-20',
        leads: 48,
        conversionRate: 0.18,
        revenueGenerated: 150000
      }
    ],
    targetedIndustries: ['Financial Services', 'Healthcare', 'Retail'],
    targetedRegions: ['Northeast US', 'West Coast US', 'Canada'],
    coMarketingRecommendation: {
      score: 92,
      opportunities: 'High',
      fundAvailability: 'High',
      alignment: 'High'
    }
  },
  {
    id: 'PTR-002',
    name: 'CloudServePro',
    tier: 'Advanced',
    specialization: 'Cloud Managed Services',
    marketingFund: 45000,
    fundUtilization: 0.65,
    marketingContacts: [
      {
        name: 'Robert Johnson',
        role: 'Partner Marketing Lead',
        email: 'robert.johnson@cloudservepro.com',
        phone: '555-789-1234'
      }
    ],
    previousCampaigns: [
      {
        name: 'Cloud Security Summit',
        type: 'Virtual Conference',
        date: '2025-03-10',
        leads: 87,
        conversionRate: 0.09,
        revenueGenerated: 120000
      }
    ],
    targetedIndustries: ['Financial Services', 'Manufacturing', 'Public Sector'],
    targetedRegions: ['Southeast US', 'Central US', 'LATAM'],
    coMarketingRecommendation: {
      score: 75,
      opportunities: 'Medium',
      fundAvailability: 'Medium',
      alignment: 'High'
    }
  },
  {
    id: 'PTR-003',
    name: 'DataSystems Inc',
    tier: 'Select',
    specialization: 'Data Analytics',
    marketingFund: 25000,
    fundUtilization: 0.20,
    marketingContacts: [
      {
        name: 'Lisa Chen',
        role: 'Marketing Coordinator',
        email: 'lisa.chen@datasystems.com',
        phone: '555-456-7890'
      }
    ],
    previousCampaigns: [
      {
        name: 'Data Analytics Workshop',
        type: 'Webinar',
        date: '2025-03-25',
        leads: 35,
        conversionRate: 0.08,
        revenueGenerated: 42000
      }
    ],
    targetedIndustries: ['Healthcare', 'Financial Services', 'Education'],
    targetedRegions: ['Northeast US', 'Europe', 'APAC'],
    coMarketingRecommendation: {
      score: 68,
      opportunities: 'Medium',
      fundAvailability: 'High',
      alignment: 'Medium'
    }
  },
  {
    id: 'PTR-004',
    name: 'SecureCloud Solutions',
    tier: 'Advanced',
    specialization: 'Security & Compliance',
    marketingFund: 50000,
    fundUtilization: 0.40,
    marketingContacts: [
      {
        name: 'Michael Rodriguez',
        role: 'Marketing Director',
        email: 'michael.rodriguez@securecloud.com',
        phone: '555-234-5678'
      },
      {
        name: 'Sarah Kim',
        role: 'Events Manager',
        email: 'sarah.kim@securecloud.com',
        phone: '555-234-5679'
      }
    ],
    previousCampaigns: [
      {
        name: 'Financial Services Security Forum',
        type: 'In-person Event',
        date: '2025-03-11',
        leads: 68,
        conversionRate: 0.18,
        revenueGenerated: 320000
      },
      {
        name: 'Healthcare Compliance Webinar',
        type: 'Webinar',
        date: '2025-02-20',
        leads: 72,
        conversionRate: 0.11,
        revenueGenerated: 110000
      }
    ],
    targetedIndustries: ['Financial Services', 'Healthcare', 'Public Sector'],
    targetedRegions: ['East Coast US', 'West Coast US', 'Europe'],
    coMarketingRecommendation: {
      score: 88,
      opportunities: 'High',
      fundAvailability: 'Medium',
      alignment: 'High'
    }
  }
];

export const customerAccountData = [
  {
    id: 'ACC-1001',
    name: 'Acme Corp',
    industry: 'Manufacturing',
    annualRevenue: 150000000,
    region: 'West Coast US',
    buyingCommittee: [
      { name: 'John Smith', title: 'CTO', influenceLevel: 'High' },
      { name: 'Lisa Wong', title: 'IT Director', influenceLevel: 'Medium' },
      { name: 'Michael Brown', title: 'CEO', influenceLevel: 'Medium' }
    ],
    partnerRelationships: [
      { partnerName: 'TechConsult Partners', strength: 'High', accountContacts: ['John Smith', 'Lisa Wong'] },
      { partnerName: 'CloudServePro', strength: 'Medium', accountContacts: ['Lisa Wong'] },
      { partnerName: 'DataSystems Inc', strength: 'Low', accountContacts: ['IT Team'] }
    ],
    marketingHistory: [
      { campaign: 'Cloud Migration Summit', attended: true, leadsGenerated: 2 },
      { campaign: 'Digital Transformation Workshop', attended: true, leadsGenerated: 1 }
    ],
    coMarketingOpportunity: {
      score: 85,
      recommendedPartner: 'TechConsult Partners',
      reasonCode: 'Strong existing relationship with key decision makers'
    }
  },
  {
    id: 'ACC-1002',
    name: 'TechCorp',
    industry: 'Technology',
    annualRevenue: 85000000,
    region: 'Northeast US',
    buyingCommittee: [
      { name: 'Lisa Tang', title: 'CIO', influenceLevel: 'High' },
      { name: 'David Johnson', title: 'Infrastructure Director', influenceLevel: 'High' },
      { name: 'Sarah Williams', title: 'CFO', influenceLevel: 'Medium' }
    ],
    partnerRelationships: [
      { partnerName: 'TechConsult Partners', strength: 'Medium', accountContacts: ['Infrastructure Team'] }
    ],
    marketingHistory: [],
    coMarketingOpportunity: {
      score: 72,
      recommendedPartner: 'TechConsult Partners',
      reasonCode: 'Targeted industry alignment with partner expertise'
    }
  },
  {
    id: 'ACC-1003',
    name: 'GlobalRetail',
    industry: 'Retail',
    annualRevenue: 320000000,
    region: 'National',
    buyingCommittee: [
      { name: 'Robert Chen', title: 'CTO', influenceLevel: 'High' },
      { name: 'Maria Rodriguez', title: 'Data Analytics Lead', influenceLevel: 'High' },
      { name: 'James Wilson', title: 'Chief Digital Officer', influenceLevel: 'High' }
    ],
    partnerRelationships: [
      { partnerName: 'CloudServePro', strength: 'High', accountContacts: ['Robert Chen', 'IT Team'] },
      { partnerName: 'DataSystems Inc', strength: 'Medium', accountContacts: ['Maria Rodriguez'] }
    ],
    marketingHistory: [
      { campaign: 'Retail Digital Transformation Summit', attended: true, leadsGenerated: 3 }
    ],
    coMarketingOpportunity: {
      score: 92,
      recommendedPartner: 'CloudServePro',
      reasonCode: 'Previous marketing success and strong executive relationships'
    }
  },
  {
    id: 'ACC-1004',
    name: 'AlphaBank',
    industry: 'Financial Services',
    annualRevenue: 750000000,
    region: 'East Coast US',
    buyingCommittee: [
      { name: 'Mark Johnson', title: 'CISO', influenceLevel: 'High' },
      { name: 'Rachel Garcia', title: 'Security Director', influenceLevel: 'High' },
      { name: 'Thomas Brown', title: 'CIO', influenceLevel: 'Medium' }
    ],
    partnerRelationships: [
      { partnerName: 'SecureCloud Solutions', strength: 'High', accountContacts: ['Mark Johnson', 'Rachel Garcia'] },
      { partnerName: 'DataSystems Inc', strength: 'Medium', accountContacts: ['Analytics Team'] }
    ],
    marketingHistory: [
      { campaign: 'Financial Services Security Forum', attended: true, leadsGenerated: 2 }
    ],
    coMarketingOpportunity: {
      score: 90,
      recommendedPartner: 'SecureCloud Solutions',
      reasonCode: 'Industry-specific marketing success with security focus'
    }
  },
  {
    id: 'ACC-1005',
    name: 'MediCorp',
    industry: 'Healthcare',
    annualRevenue: 420000000,
    region: 'Southeast US',
    buyingCommittee: [
      { name: 'Dr. Sarah Carter', title: 'CIO', influenceLevel: 'High' },
      { name: 'Dr. Michael Lee', title: 'Chief Medical Information Officer', influenceLevel: 'High' },
      { name: 'Lisa Martinez', title: 'Compliance Director', influenceLevel: 'Medium' }
    ],
    partnerRelationships: [
      { partnerName: 'SecureCloud Solutions', strength: 'High', accountContacts: ['Dr. Sarah Carter', 'Lisa Martinez'] },
      { partnerName: 'TechConsult Partners', strength: 'Low', accountContacts: ['IT Staff'] }
    ],
    marketingHistory: [
      { campaign: 'Healthcare Compliance Webinar', attended: true, leadsGenerated: 1 }
    ],
    coMarketingOpportunity: {
      score: 88,
      recommendedPartner: 'SecureCloud Solutions',
      reasonCode: 'Strong healthcare compliance expertise alignment'
    }
  }
];

export const marketingCampaignTemplates = [
  {
    id: 'TPL-001',
    name: 'Industry-Specific Webinar Series',
    type: 'Virtual',
    format: '3-part webinar series',
    duration: '3 weeks',
    typicalResults: { leads: 80, conversionRate: 0.12, costPerLead: 180 },
    requiredResources: { budget: 15000, planningTimeWeeks: 4, executionTimeWeeks: 3 },
    recommendedIndustries: ['Financial Services', 'Healthcare', 'Retail'],
    successFactors: ['Industry-specific content', 'Customer testimonials', 'Partner specialist presenters']
  },
  {
    id: 'TPL-002',
    name: 'Executive Roundtable',
    type: 'In-person',
    format: 'Half-day event with 10-15 executives',
    duration: '4 hours',
    typicalResults: { leads: 12, conversionRate: 0.25, costPerLead: 850 },
    requiredResources: { budget: 10000, planningTimeWeeks: 6, executionTimeWeeks: 1 },
    recommendedIndustries: ['All'],
    successFactors: ['High-level content', 'Exclusive venue', 'Senior executive participation']
  },
  {
    id: 'TPL-003',
    name: 'Technical Workshop',
    type: 'Hybrid',
    format: 'Full-day hands-on workshop',
    duration: '8 hours',
    typicalResults: { leads: 30, conversionRate: 0.18, costPerLead: 390 },
    requiredResources: { budget: 12000, planningTimeWeeks: 5, executionTimeWeeks: 1 },
    recommendedIndustries: ['Technology', 'Manufacturing', 'Retail'],
    successFactors: ['Hands-on labs', 'Technical experts', 'Real-world use cases']
  },
  {
    id: 'TPL-004',
    name: 'Joint Case Study',
    type: 'Content',
    format: 'Written + video case study',
    duration: 'Everred',
    typicalResults: { leads: 45, conversionRate: 0.10, costPerLead: 110 },
    requiredResources: { budget: 5000, planningTimeWeeks: 3, executionTimeWeeks: 4 },
    recommendedIndustries: ['All'],
    successFactors: ['Quantifiable results', 'Customer participation', 'Multi-format distribution']
  },
  {
    id: 'TPL-005',
    name: 'Industry Conference Sponsorship',
    type: 'In-person',
    format: 'Joint booth and speaking session',
    duration: '2-3 days',
    typicalResults: { leads: 100, conversionRate: 0.08, costPerLead: 450 },
    requiredResources: { budget: 45000, planningTimeWeeks: 12, executionTimeWeeks: 1 },
    recommendedIndustries: ['All'],
    successFactors: ['Prime booth location', 'Speaking session', 'Pre-event promotion']
  }
];