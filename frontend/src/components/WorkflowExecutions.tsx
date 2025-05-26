import React, { useState, useEffect } from 'react';

// AWS Tagging Workflow Execution
export const AwsTaggingExecution = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [taggedOpportunities, setTaggedOpportunities] = useState<any[]>([]);
  const [mockData, setMockData] = useState<any>(null);

  useEffect(() => {
    import('../data/mockData.json').then(data => setMockData(data));
  }, []);

  if (!mockData) return <div>Loading...</div>;
  const { opportunities } = mockData;

  const steps = [
    {
      title: 'Analyzing request',
      content: "I'll help you identify and tag AWS opportunities in your pipeline. Let me analyze your CRM data to find potential AWS mentions."
    },
    {
      title: 'Searching CRM for AWS mentions',
      content: (
        <div>
          <p className="mb-4">Searching through your CRM data for opportunities that mention AWS services or indicate AWS involvement. I'm looking at:</p>
          <ul className="list-disc list-inside ml-4 text-gray-300 mb-4">
            <li>Opportunity descriptions</li>
            <li>Sales call notes</li>
            <li>Email communications</li>
            <li>Customer requirements documents</li>
          </ul>
          <div className="bg-gray-800 p-3 rounded-lg mt-2 animate-pulse">
            <p className="text-sm">Scanning 156 opportunities in CRM...</p>
          </div>
        </div>
      )
    },
    {
      title: 'Analyzing opportunities',
      content: (
        <div>
          <p className="mb-4">I've identified the following opportunities that mention AWS but are not properly tagged:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Opportunity</th>
                  <th className="border border-gray-700 p-2 text-left">Customer</th>
                  <th className="border border-gray-700 p-2 text-left">Value</th>
                  <th className="border border-gray-700 p-2 text-left">Stage</th>
                  <th className="border border-gray-700 p-2 text-left">AWS Evidence</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp, index) => (
                  <tr key={index} className="bg-gray-900 hover:bg-gray-800">
                    <td className="border border-gray-700 p-2">{opp.name}</td>
                    <td className="border border-gray-700 p-2">{opp.customer}</td>
                    <td className="border border-gray-700 p-2">${opp.value.toLocaleString()}</td>
                    <td className="border border-gray-700 p-2">{opp.stage}</td>
                    <td className="border border-gray-700 p-2 text-blue-400">
                      {(opp.notes.includes('AWS') || opp.description.includes('AWS') || 
                       opp.calls?.some(call => call.summary.includes('AWS')) || 
                       opp.emails?.some(email => email.content.includes('AWS'))) 
                        ? 'Found AWS mentions in ' + 
                          [
                            opp.notes.includes('AWS') ? 'notes' : null,
                            opp.description.includes('AWS') ? 'description' : null,
                            opp.calls?.some(call => call.summary.includes('AWS')) ? 'calls' : null,
                            opp.emails?.some(email => email.content.includes('AWS')) ? 'emails' : null
                          ].filter(Boolean).join(', ')
                        : 'No AWS mentions found'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-800">
            <p className="text-sm">
              <span className="font-semibold">Analysis:</span> Found {opportunities.length} opportunities with AWS mentions.
              Total potential AWS-related opportunity value: ${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Confirming tagging action',
      content: (
        <div>
          <p className="mb-4">I recommend adding the "AWS Partner" tag to all identified opportunities. Would you like me to proceed with tagging these opportunities?</p>
          <div className="flex space-x-4 mt-6">
            <button 
              onClick={() => {
                setTaggedOpportunities(opportunities.map(opp => ({
                  ...opp,
                  tags: [...(opp.tags || []), 'AWS Partner']
                })));
                setStep(prev => prev + 1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Yes, tag all opportunities
            </button>
            <button 
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              onClick={() => setStep(prev => prev + 1)}
            >
              No, I'll review them manually
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Setting tags in CRM',
      content: (
        <div>
          <p className="mb-4">
            {taggedOpportunities.length > 0 
              ? 'Applying "AWS Partner" tag to all identified opportunities...' 
              : "You've chosen to review opportunities manually. I'll provide a summary for your reference."}
          </p>
          {taggedOpportunities.length > 0 && (
            <div className="space-y-2">
              {opportunities.map((opp, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-6 h-6 mr-2 text-red-500">✓</div>
                  <div>{opp.name} - {opp.customer}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm">
              {taggedOpportunities.length > 0 
                ? 'All opportunities successfully tagged in CRM.' 
                : 'Summary report prepared for manual review.'}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Summary Report',
      content: (
        <div>
          <div className="p-4 bg-red-900 bg-opacity-30 rounded-lg border border-red-800 mb-6">
            <p className="text-xl font-semibold mb-2">🎉 AWS Opportunity Tagging Complete</p>
            <p className="mb-3">
              {taggedOpportunities.length > 0 
                ? `Successfully tagged ${taggedOpportunities.length} opportunities with "AWS Partner" tag` 
                : `Identified ${opportunities.length} opportunities for manual review`}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Opportunity Distribution by Stage</h4>
              <div className="space-y-2">
                {Object.entries(
                  opportunities.reduce((acc: Record<string, number>, opp) => {
                    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([stage, count], i) => (
                  <div key={i} className="flex justify-between">
                    <span>{stage}:</span>
                    <span className="font-semibold">{String(count)} opportunities</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Financial Impact</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Potential Value:</span>
                  <span className="font-semibold">${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Opportunity Value:</span>
                  <span className="font-semibold">
                    ${Math.round(opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Next Steps</h4>
            <ul className="list-disc list-inside ml-2 text-gray-300">
              <li>Review tagged opportunities in your CRM</li>
              <li>Consider registering high-value opportunities in AWS ACE</li>
              <li>Engage AWS Partner team for strategic opportunities</li>
              <li>Schedule joint planning sessions with AWS and key customers</li>
            </ul>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Complete Workflow
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress tracker */}
      <div className="relative mb-8">
        <div className="absolute h-1 w-full bg-gray-700 rounded">
          <div 
            className="absolute h-1 bg-blue-600 rounded transition-all duration-500"
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  i < step ? 'bg-red-600' : i === step ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                {i < step ? '✓' : ''}
              </div>
              <div className="text-xs mt-1 hidden md:block">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <h3 className="text-xl font-semibold mb-4">{steps[step].title}</h3>
        <div className="text-gray-300">
          {steps[step].content}
        </div>
      </div>

      {/* Navigation buttons */}
      {step < steps.length - 1 && step > 0 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
      
      {step === 0 && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setStep(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );
};

// Partner Retention Workflow Execution
export const PartnerRetentionExecution = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState('Acme Corp');
  const [mockData, setMockData] = useState<any>(null);

  useEffect(() => {
    import('../data/mockData.json').then(data => setMockData(data));
  }, []);

  if (!mockData) return <div>Loading...</div>;
  const { partners } = mockData;

  const atRiskAccount = { name: 'Acme Corp', churnRisk: 'High', renewalDate: '2025-08-15', annualValue: 320000 };
  
  const relevantPartners = partners.filter(p => 
    p.accounts.some(a => a.name === selectedAccount)
  );

  const steps = [
    {
      title: 'Analyzing request',
      content: (
        <div>
          <p className="mb-4">I'll help you identify partners who can assist with your at-risk customer account. First, let me understand which account you're concerned about.</p>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Select the at-risk account:</label>
            <select 
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="Acme Corp">Acme Corp</option>
              <option value="TechCorp">TechCorp</option>
              <option value="GlobalRetail">GlobalRetail</option>
              <option value="AlphaBank">AlphaBank</option>
              <option value="MediCorp">MediCorp</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Analyze Account
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Analyzing at-risk account',
      content: (
        <div>
          <p className="mb-4">Analyzing {selectedAccount} to understand the current situation and identify potential partners who could help with retention...</p>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-lg mb-3">Account Overview: {selectedAccount}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Churn Risk:</p>
                <p className="text-red-400 font-semibold">High</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Annual Contract Value:</p>
                <p className="font-semibold">${atRiskAccount.annualValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Renewal Date:</p>
                <p className="font-semibold">{atRiskAccount.renewalDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Days Until Renewal:</p>
                <p className="font-semibold">103</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-3">Risk Factors</h4>
            <ul className="list-disc list-inside ml-2 text-gray-300">
              <li>Limited product adoption (2 out of 5 modules)</li>
              <li>Key stakeholder departure (Previous CIO was champion)</li>
              <li>Competitive pressure (Evaluating alternative solution)</li>
              <li>Technical issues reported in last quarter</li>
            </ul>
          </div>
          
          <div className="mt-6 animate-pulse">
            <p>Finding partners with relationships at {selectedAccount}...</p>
          </div>
        </div>
      )
    },
    {
      title: 'Partner mapping',
      content: (
        <div>
          <p className="mb-4">I've identified {relevantPartners.length} partners with existing relationships at {selectedAccount}:</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Partner</th>
                  <th className="border border-gray-700 p-2 text-left">Relationship Strength</th>
                  <th className="border border-gray-700 p-2 text-left">Previous Joint Deals</th>
                  <th className="border border-gray-700 p-2 text-left">Key Contact</th>
                  <th className="border border-gray-700 p-2 text-left">Last Deal Date</th>
                </tr>
              </thead>
              <tbody>
                {relevantPartners.map((partner, index) => {
                  const accountInfo = partner.accounts.find(a => a.name === selectedAccount);
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-800 ${
                        accountInfo?.relationshipStrength === 'High' ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-900'
                      }`}
                    >
                      <td className="border border-gray-700 p-2">{partner.name}</td>
                      <td className="border border-gray-700 p-2">
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 ${
                              accountInfo?.relationshipStrength === 'High' ? 'bg-red-500' :
                              accountInfo?.relationshipStrength === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          ></div>
                          {accountInfo?.relationshipStrength} ({accountInfo?.relationshipLevel})
                        </div>
                      </td>
                      <td className="border border-gray-700 p-2">{accountInfo?.previousDeals || 0}</td>
                      <td className="border border-gray-700 p-2">
                        {partner.contacts[0].name}
                      </td>
                      <td className="border border-gray-700 p-2">{accountInfo?.lastDealDate || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-3 bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Analysis Insights</h4>
            <ul className="list-disc list-inside ml-2 text-gray-300 mb-3">
              <li>
                <strong>TechConsult Partners</strong> has the strongest relationship with executive-level access
              </li>
              <li>
                <strong>CloudServePro</strong> has a department-level relationship but fewer joint deals
              </li>
              <li>
                <strong>DataSystems Inc</strong> has only project-level engagement with limited history
              </li>
            </ul>
            <p className="text-sm text-gray-400">
              Based on relationship strength, deal history, and account access, TechConsult Partners is best positioned to help with retention efforts.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Partner recommendation',
      content: (
        <div>
          <div className="p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-800 mb-6">
            <h4 className="text-xl font-semibold mb-2">Recommended Partner: <span className="text-blue-400">TechConsult Partners</span></h4>
            <p className="mb-3">Partner tier: Premier | AWS Competencies: Migration, DevOps, Data & Analytics</p>
          </div>
          
          <h4 className="font-semibold mb-3">Recommendation Rationale:</h4>
          <ul className="list-disc list-inside ml-4 text-gray-300 mb-6">
            <li>Strong executive relationship with {selectedAccount} CIO</li>
            <li>5 successful joint deals in the past 12 months</li>
            <li>Deep knowledge of customer's technical environment</li>
            <li>Complementary services that address identified risk factors</li>
            <li>92% success rate in similar retention scenarios</li>
          </ul>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-3 rounded-lg">
              <h5 className="font-semibold mb-2">Potential Retention Strategy</h5>
              <ol className="list-decimal list-inside ml-2 text-gray-300 text-sm">
                <li>Joint technical review with TechConsult Partners</li>
                <li>Executive alignment workshop</li>
                <li>Address technical issues with partner resources</li>
                <li>Create joint adoption plan for unused modules</li>
              </ol>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <h5 className="font-semibold mb-2">Key Contact</h5>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-400">Name:</span> Sarah Johnson</p>
                <p><span className="text-gray-400">Role:</span> Partner Alliance Manager</p>
                <p><span className="text-gray-400">Email:</span> sarah.johnson@techconsult.com</p>
                <p><span className="text-gray-400">Phone:</span> 555-123-4567</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <h4 className="font-semibold mb-2">Would you like me to:</h4>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-left transition-colors">
                Connect you with Sarah Johnson from TechConsult Partners
              </button>
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                Prepare a joint retention strategy document
              </button>
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                Schedule a three-way meeting with TechConsult and {selectedAccount}
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Complete Workflow
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress tracker */}
      <div className="relative mb-8">
        <div className="absolute h-1 w-full bg-gray-700 rounded">
          <div 
            className="absolute h-1 bg-blue-600 rounded transition-all duration-500"
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  i < step ? 'bg-red-600' : i === step ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                {i < step ? '✓' : ''}
              </div>
              <div className="text-xs mt-1 hidden md:block">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <h3 className="text-xl font-semibold mb-4">{steps[step].title}</h3>
        <div className="text-gray-300">
          {steps[step].content}
        </div>
      </div>

      {/* Navigation buttons */}
      {step < steps.length - 1 && step > 0 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Quick Wins Workflow Execution
export const QuickWinsExecution = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState('TechConsult Partners');
  const [mockData, setMockData] = useState<any>(null);

  useEffect(() => {
    import('../data/mockData.json').then(data => setMockData(data));
  }, []);

  if (!mockData) return <div>Loading...</div>;
  const { partners, targetAccounts } = mockData;

  const filteredAccounts = targetAccounts.filter(account => 
    account.matchedPartners.some(p => p.name === selectedPartner)
  );

  const steps = [
    {
      title: 'Analyzing request',
      content: (
        <div>
          <p className="mb-4">I'll help you identify quick win opportunities for a partnership. First, let me know which partner you're focusing on.</p>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Select partner for quick win analysis:</label>
            <select 
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              {partners.map((partner, idx) => (
                <option key={idx} value={partner.name}>{partner.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Analyze Partnership
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Analyzing partnership data',
      content: (
        <div>
          <p className="mb-4">Analyzing data for potential quick win opportunities with {selectedPartner}...</p>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-lg mb-3">Partner Overview: {selectedPartner}</h4>
            {partners.filter(p => p.name === selectedPartner).map((partner, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Partnership Tier:</p>
                  <p className="font-semibold">{partner.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Specialization:</p>
                  <p className="font-semibold">{partner.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">AWS Competencies:</p>
                  <p className="font-semibold">{partner.awsCompetencies.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Primary Contact:</p>
                  <p className="font-semibold">{partner.contacts[0].name}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 animate-pulse">
            <p>Searching for accounts with highest win probability...</p>
            <p>Analyzing account manager partner-friendliness scores...</p>
            <p>Mapping partner capabilities to customer needs...</p>
          </div>
        </div>
      )
    },
    {
      title: 'Account mapping',
      content: (
        <div>
          <p className="mb-4">I've identified {filteredAccounts.length} target accounts that would be a good fit for quick wins with {selectedPartner}:</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Account</th>
                  <th className="border border-gray-700 p-2 text-left">Industry</th>
                  <th className="border border-gray-700 p-2 text-left">Fit Score</th>
                  <th className="border border-gray-700 p-2 text-left">Win Probability</th>
                  <th className="border border-gray-700 p-2 text-left">Account Manager</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account, index) => {
                  const partnerMatch = account.matchedPartners.find(p => p.name === selectedPartner);
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-800 ${
                        partnerMatch && partnerMatch.winProbability >= 0.7 ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-900'
                      }`}
                    >
                      <td className="border border-gray-700 p-2">{account.name}</td>
                      <td className="border border-gray-700 p-2">{account.industry}</td>
                      <td className="border border-gray-700 p-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${partnerMatch?.fitScore || 0}%` }}
                            ></div>
                          </div>
                          <span>{partnerMatch?.fitScore || 0}%</span>
                        </div>
                      </td>
                      <td className="border border-gray-700 p-2">
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 ${
                              partnerMatch && partnerMatch.winProbability >= 0.7 ? 'bg-red-500' :
                              partnerMatch && partnerMatch.winProbability >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          ></div>
                          {partnerMatch ? `${Math.round(partnerMatch.winProbability * 100)}%` : 'N/A'}
                        </div>
                      </td>
                      <td className="border border-gray-700 p-2">
                        <div className="flex items-center">
                          {account.accountManager.name}
                          <div 
                            className="ml-2 px-2 py-0.5 text-xs rounded"
                            style={{ 
                              backgroundColor: account.accountManager.partnerFriendlinessScore >= 8 ? 'rgba(16, 185, 129, 0.2)' : 
                                             account.accountManager.partnerFriendlinessScore >= 6 ? 'rgba(245, 158, 11, 0.2)' : 
                                             'rgba(239, 68, 68, 0.2)',
                              color: account.accountManager.partnerFriendlinessScore >= 8 ? 'rgb(16, 185, 129)' : 
                                     account.accountManager.partnerFriendlinessScore >= 6 ? 'rgb(245, 158, 11)' : 
                                     'rgb(239, 68, 68)'
                            }}
                          >
                            {account.accountManager.partnerFriendlinessScore >= 8 ? 'Partner Champion' : 
                             account.accountManager.partnerFriendlinessScore >= 6 ? 'Partner Neutral' : 
                             'Partner Resistant'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-3 bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Analysis Insights</h4>
            <ul className="list-disc list-inside ml-2 text-gray-300 mb-3">
              <li>
                <strong>Horizon Manufacturing</strong> has the highest overall score with a partner-friendly account manager
              </li>
              <li>
                <strong>NexGen Healthcare</strong> shows strong alignment with {selectedPartner}'s healthcare capabilities
              </li>
              <li>
                <strong>Metro Financial Group</strong> has potential but the account manager is less partner-oriented
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Quick win recommendations',
      content: (
        <div>
          <div className="p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-800 mb-6">
            <h4 className="text-xl font-semibold mb-2">Top Quick Win Opportunity</h4>
            {filteredAccounts.length > 0 && (
              <div>
                <p className="mb-1 text-blue-400 font-semibold">{filteredAccounts[0].name}</p>
                <p className="mb-3">Industry: {filteredAccounts[0].industry} | Needs: {filteredAccounts[0].needs}</p>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Why This Is a Quick Win</h5>
              {filteredAccounts.length > 0 && (
                <ul className="list-disc list-inside ml-2 text-gray-300 text-sm">
                  <li>High fit score ({filteredAccounts[0].matchedPartners.find(p => p.name === selectedPartner)?.fitScore}%)</li>
                  <li>{filteredAccounts[0].matchedPartners.find(p => p.name === selectedPartner)?.reason}</li>
                  <li>Account manager ({filteredAccounts[0].accountManager.name}) is partner-friendly</li>
                  <li>Clear, defined needs that match {selectedPartner}'s capabilities</li>
                  <li>Short sales cycle expected based on urgency of needs</li>
                </ul>
              )}
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Engagement Strategy</h5>
              <ol className="list-decimal list-inside ml-2 text-gray-300 text-sm space-y-1">
                <li>Joint account planning with account manager</li>
                <li>Partner-led technical discovery session</li>
                <li>Solution design workshop with customer</li>
                <li>Joint proposal development</li>
                <li>Executive alignment meeting</li>
              </ol>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Timeline</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Initial outreach:</span>
                  <span className="font-semibold">May 6, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Discovery meeting:</span>
                  <span className="font-semibold">May 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Solution proposal:</span>
                  <span className="font-semibold">May 29, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected close:</span>
                  <span className="font-semibold">June 30, 2025</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Resources Needed</h5>
              <ul className="list-disc list-inside ml-2 text-gray-300 text-sm space-y-1">
                <li>Technical solution architect from your team</li>
                <li>Executive sponsor for high-level alignment</li>
                <li>Partner alliance manager for coordination</li>
                <li>Account manager engagement and support</li>
                <li>Solution showcase/demo environment</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3">
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-left transition-colors">
                Schedule planning call with account manager and {selectedPartner}
              </button>
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                Prepare joint opportunity brief for the account team
              </button>
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                Set up partner solution briefing for the customer
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Complete Workflow
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress tracker */}
      <div className="relative mb-8">
        <div className="absolute h-1 w-full bg-gray-700 rounded">
          <div 
            className="absolute h-1 bg-blue-600 rounded transition-all duration-500"
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  i < step ? 'bg-red-600' : i === step ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                {i < step ? '✓' : ''}
              </div>
              <div className="text-xs mt-1 hidden md:block">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <h3 className="text-xl font-semibold mb-4">{steps[step].title}</h3>
        <div className="text-gray-300">
          {steps[step].content}
        </div>
      </div>

      {/* Navigation buttons */}
      {step < steps.length - 1 && step > 0 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};