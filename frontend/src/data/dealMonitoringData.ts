// Custom data for the Monitor Movement of Partner Related Deals workflow

export const partnerDeals = [
  {
    id: 'OPP-1001',
    name: 'Acme Cloud Migration',
    customer: 'Acme Corp',
    stage: {
      current: 'Discovery',
      previous: 'Prospecting',
      daysInCurrentStage: 15,
      averageDaysInStage: 10,
      status: 'At Risk' // At Risk, On Track, Ahead
    },
    value: 450000,
    closeDate: '2025-08-15',
    probability: 0.35,
    partners: [
      {
        name: 'TechConsult Partners',
        role: 'Lead Partner',
        lastActivity: '2025-04-24',
        nextActivity: '2025-05-06',
        engagement: 'High' // High, Medium, Low
      }
    ],
    stakeholders: [
      {
        name: 'John Smith',
        title: 'CTO',
        lastContact: '2025-04-18',
        sentiment: 'Positive' // Positive, Neutral, Negative
      },
      {
        name: 'Lisa Wong',
        title: 'IT Director',
        lastContact: '2025-04-22',
        sentiment: 'Neutral'
      }
    ],
    healthIndicators: {
      overall: 'At Risk', // At Risk, Neutral, Healthy
      communication: 'At Risk',
      momentum: 'Neutral',
      competitivePosition: 'Healthy'
    },
    lastUpdated: '2025-04-28',
    riskFactors: [
      {
        type: 'Stalled Communication',
        description: 'No response from IT Director for 7+ days',
        severity: 'Medium',
        mitigationPlan: 'Escalate to executive sponsor'
      },
      {
        type: 'Extended Stage Duration',
        description: 'Deal has been in Discovery 50% longer than average',
        severity: 'Medium',
        mitigationPlan: 'Schedule solution validation workshop'
      }
    ]
  },
  {
    id: 'OPP-1003',
    name: 'GlobalRetail Data Solution',
    customer: 'GlobalRetail',
    stage: {
      current: 'Negotiation',
      previous: 'Proposal',
      daysInCurrentStage: 25,
      averageDaysInStage: 15,
      status: 'At Risk'
    },
    value: 520000,
    closeDate: '2025-06-30',
    probability: 0.65,
    partners: [
      {
        name: 'DataSystems Inc',
        role: 'Technical Partner',
        lastActivity: '2025-04-20',
        nextActivity: '2025-05-02',
        engagement: 'Medium'
      },
      {
        name: 'CloudServePro',
        role: 'Implementation Partner',
        lastActivity: '2025-04-25',
        nextActivity: '2025-05-01',
        engagement: 'High'
      }
    ],
    stakeholders: [
      {
        name: 'Robert Chen',
        title: 'CTO',
        lastContact: '2025-04-26',
        sentiment: 'Positive'
      },
      {
        name: 'Maria Rodriguez',
        title: 'Data Analytics Lead',
        lastContact: '2025-04-21',
        sentiment: 'Neutral'
      }
    ],
    healthIndicators: {
      overall: 'At Risk',
      communication: 'Healthy',
      momentum: 'At Risk',
      competitivePosition: 'At Risk'
    },
    lastUpdated: '2025-04-29',
    riskFactors: [
      {
        type: 'Price Negotiation',
        description: 'Customer pushing for additional 15% discount',
        severity: 'High',
        mitigationPlan: 'Revise pricing structure with value-adds instead of discounts'
      },
      {
        type: 'Competitive Pressure',
        description: 'Competing solution from major vendor being evaluated',
        severity: 'High',
        mitigationPlan: 'Schedule competitive differentiation workshop'
      }
    ]
  },
  {
    id: 'OPP-1002',
    name: 'TechCorp Platform Upgrade',
    customer: 'TechCorp',
    stage: {
      current: 'Proposal',
      previous: 'Discovery',
      daysInCurrentStage: 12,
      averageDaysInStage: 18,
      status: 'Ahead'
    },
    value: 275000,
    closeDate: '2025-07-30',
    probability: 0.75,
    partners: [
      {
        name: 'TechConsult Partners',
        role: 'Lead Partner',
        lastActivity: '2025-04-27',
        nextActivity: '2025-05-03',
        engagement: 'High'
      }
    ],
    stakeholders: [
      {
        name: 'Lisa Tang',
        title: 'CIO',
        lastContact: '2025-04-28',
        sentiment: 'Positive'
      },
      {
        name: 'David Johnson',
        title: 'Infrastructure Director',
        lastContact: '2025-04-26',
        sentiment: 'Positive'
      }
    ],
    healthIndicators: {
      overall: 'Healthy',
      communication: 'Healthy',
      momentum: 'Healthy',
      competitivePosition: 'Healthy'
    },
    lastUpdated: '2025-04-28',
    riskFactors: []
  },
  {
    id: 'OPP-1005',
    name: 'MediCorp Patient Platform',
    customer: 'MediCorp',
    stage: {
      current: 'Discovery',
      previous: 'Prospecting',
      daysInCurrentStage: 8,
      averageDaysInStage: 10,
      status: 'On Track'
    },
    value: 620000,
    closeDate: '2025-10-30',
    probability: 0.40,
    partners: [
      {
        name: 'SecureCloud Solutions',
        role: 'Security Partner',
        lastActivity: '2025-04-26',
        nextActivity: '2025-05-08',
        engagement: 'High'
      },
      {
        name: 'DataSystems Inc',
        role: 'Data Analytics Partner',
        lastActivity: '2025-04-25',
        nextActivity: '2025-05-10',
        engagement: 'Low'
      }
    ],
    stakeholders: [
      {
        name: 'Dr. Sarah Carter',
        title: 'CIO',
        lastContact: '2025-04-27',
        sentiment: 'Positive'
      },
      {
        name: 'Dr. Michael Lee',
        title: 'Chief Medical Information Officer',
        lastContact: '2025-04-22',
        sentiment: 'Neutral'
      }
    ],
    healthIndicators: {
      overall: 'Healthy',
      communication: 'Healthy',
      momentum: 'Neutral',
      competitivePosition: 'Healthy'
    },
    lastUpdated: '2025-04-27',
    riskFactors: [
      {
        type: 'Partner Coordination',
        description: 'DataSystems Inc has low engagement with the opportunity',
        severity: 'Low',
        mitigationPlan: 'Schedule joint planning session with DataSystems Inc'
      }
    ]
  }
];

export const partnerDealTrends = {
  stageProgression: {
    averageDaysInDiscovery: 14,
    averageDaysInProposal: 18,
    averageDaysInNegotiation: 21,
    totalAverageSalesCycle: 68,
    dealsStuckInStage: 2
  },
  partnerEngagement: {
    highEngagementWinRate: 0.78,
    mediumEngagementWinRate: 0.52,
    lowEngagementWinRate: 0.31,
    averagePartnerActivitiesPerWeek: 2.4
  },
  communicationPatterns: {
    dealsWithRegularCommunication: 12,
    dealsWithIrregularCommunication: 5,
    regularCommunicationWinRate: 0.73,
    irregularCommunicationWinRate: 0.41
  },
  overallHealth: {
    healthy: 8,
    neutral: 5,
    atRisk: 4,
    atRiskConversionRate: 0.31
  }
};

export const recommendedActions = [
  {
    opportunity: 'OPP-1001',
    action: 'Escalate to executive sponsor',
    assignTo: 'Sarah Johnson',
    dueDate: '2025-05-05',
    impact: 'High',
    notes: 'Executive alignment needed to address communication issues with IT Director'
  },
  {
    opportunity: 'OPP-1001',
    action: 'Schedule solution validation workshop',
    assignTo: 'TechConsult Partners',
    dueDate: '2025-05-10',
    impact: 'Medium',
    notes: 'Validate solution requirements to accelerate through Discovery stage'
  },
  {
    opportunity: 'OPP-1003',
    action: 'Revise pricing structure',
    assignTo: 'Jessica Lee',
    dueDate: '2025-05-01',
    impact: 'High',
    notes: 'Develop value-based pricing approach instead of direct discounting'
  },
  {
    opportunity: 'OPP-1003',
    action: 'Competitive differentiation workshop',
    assignTo: 'CloudServePro',
    dueDate: '2025-05-03',
    impact: 'High',
    notes: 'Highlight unique value proposition against competing solution'
  },
  {
    opportunity: 'OPP-1005',
    action: 'Joint planning session with DataSystems Inc',
    assignTo: 'Thomas Wilson',
    dueDate: '2025-05-05',
    impact: 'Medium',
    notes: 'Increase DataSystems Inc engagement in the opportunity'
  }
];