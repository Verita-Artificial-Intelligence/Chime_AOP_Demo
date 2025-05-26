import React, { useState, useEffect } from 'react';
import { ProgressTracker, DataTable, Modal, StatCard } from './index';

import('../data/coMarketingData.json');

export const CoMarketingExecution = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    import('../data/coMarketingData.json').then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  const { partnerData, customerAccountData, marketingCampaignTemplates } = data;
  const selectedPartnerData = partnerData.find((p: any) => p.name === selectedPartner);
  const selectedAccountData = customerAccountData.find((a: any) => a.name === selectedAccount);
  const selectedTemplateData = marketingCampaignTemplates.find((t: any) => t.id === selectedTemplate);

  const steps = [
    {
      title: 'Analyzing request',
      content: (
        <div>
          <p className="mb-4">I'll help you identify co-marketing opportunities with your partners. Let me analyze your partner ecosystem and customer accounts to find the best matches.</p>
          <div className="animate-pulse mt-6 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      )
    },
    {
      title: 'Partner analysis',
      content: (
        <div>
          <div className="p-4 bg-brand-background bg-opacity-20 border border-brand-border rounded-lg mb-6">
            <p className="font-semibold mb-1">Co-Marketing Opportunity Analysis</p>
            <p className="text-sm text-gray-300">I've analyzed your partners based on their co-marketing potential, prior campaign success, fund availability, and audience alignment.</p>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Partner</th>
                  <th className="border border-gray-700 p-2 text-left">Tier</th>
                  <th className="border border-gray-700 p-2 text-left">Specialization</th>
                  <th className="border border-gray-700 p-2 text-left">Marketing Fund</th>
                  <th className="border border-gray-700 p-2 text-left">Previous Campaigns</th>
                  <th className="border border-gray-700 p-2 text-left">Co-Marketing Score</th>
                  <th className="border border-gray-700 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partnerData.sort((a: any, b: any) => b.coMarketingRecommendation.score - a.coMarketingRecommendation.score).map((partner: any, index: number) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-800 ${
                      partner.coMarketingRecommendation.score >= 85 ? 'bg-brand-background bg-opacity-20' : 'bg-gray-900'
                    }`}
                  >
                    <td className="border border-gray-700 p-2">{partner.name}</td>
                    <td className="border border-gray-700 p-2">{partner.tier}</td>
                    <td className="border border-gray-700 p-2">{partner.specialization}</td>
                    <td className="border border-gray-700 p-2">
                      <div className="flex items-center">
                        <div>${partner.marketingFund.toLocaleString()}</div>
                        <div 
                          className="ml-2 w-16 bg-gray-700 h-2 rounded-full overflow-hidden"
                          title={`${Math.round(partner.fundUtilization * 100)}% utilized`}
                        >
                          <div 
                            className="bg-brand-primary h-full" 
                            style={{ width: `${partner.fundUtilization * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">{partner.previousCampaigns.length}</td>
                    <td className="border border-gray-700 p-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-brand-primary h-2.5 rounded-full" 
                            style={{ width: `${partner.coMarketingRecommendation.score}%` }}
                          ></div>
                        </div>
                        <span>{partner.coMarketingRecommendation.score}/100</span>
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">
                      <button
                        onClick={() => setSelectedPartner(partner.name)}
                        className="px-2 py-1 bg-brand-primary text-white rounded text-sm"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedPartner && selectedPartnerData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 p-4">
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Partner Analysis: {selectedPartnerData.name}</h3>
                  <button 
                    onClick={() => setSelectedPartner(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Partner Tier</div>
                    <div className="font-semibold">{selectedPartnerData.tier}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Specialization</div>
                    <div className="font-semibold">{selectedPartnerData.specialization}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Available Marketing Funds</div>
                    <div className="font-semibold">
                      ${Math.round((1 - selectedPartnerData.fundUtilization) * selectedPartnerData.marketingFund).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Marketing Contacts</h4>
                    <div className="space-y-2">
                      {selectedPartnerData.marketingContacts.map((contact: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded">
                          <div className="font-semibold">{contact.name}</div>
                          <div className="text-sm text-gray-300">Role: {contact.role}</div>
                          <div className="text-sm text-gray-300">
                            <span className="text-gray-400">Email:</span> {contact.email}
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className="text-gray-400">Phone:</span> {contact.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Previous Campaigns</h4>
                    <div className="space-y-2">
                      {selectedPartnerData.previousCampaigns.map((campaign: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded">
                          <div className="font-semibold">{campaign.name}</div>
                          <div className="text-sm text-gray-300">
                            <span className="text-gray-400">Type:</span> {campaign.type}
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className="text-gray-400">Date:</span> {campaign.date}
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className="text-gray-400">Results:</span> {campaign.leads} leads, 
                            {Math.round(campaign.conversionRate * 100)}% conversion, 
                            ${campaign.revenueGenerated.toLocaleString()} revenue
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Targeted Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartnerData.targetedIndustries.map((industry: string, idx: number) => (
                        <div key={idx} className="px-2 py-1 bg-gray-700 rounded text-sm">
                          {industry}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Targeted Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartnerData.targetedRegions.map((region: string, idx: number) => (
                        <div key={idx} className="px-2 py-1 bg-gray-700 rounded text-sm">
                          {region}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-brand-background bg-opacity-20 border border-brand-border p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">Co-Marketing Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <div className="text-sm text-gray-400">Overall Score</div>
                      <div className="text-xl font-bold">{selectedPartnerData.coMarketingRecommendation.score}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Opportunities</div>
                      <div className={`font-semibold ${
                        selectedPartnerData.coMarketingRecommendation.opportunities === 'High' ? 'text-red-400' :
                        selectedPartnerData.coMarketingRecommendation.opportunities === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {selectedPartnerData.coMarketingRecommendation.opportunities}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Fund Availability</div>
                      <div className={`font-semibold ${
                        selectedPartnerData.coMarketingRecommendation.fundAvailability === 'High' ? 'text-red-400' :
                        selectedPartnerData.coMarketingRecommendation.fundAvailability === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {selectedPartnerData.coMarketingRecommendation.fundAvailability}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Alignment</div>
                      <div className={`font-semibold ${
                        selectedPartnerData.coMarketingRecommendation.alignment === 'High' ? 'text-red-400' :
                        selectedPartnerData.coMarketingRecommendation.alignment === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {selectedPartnerData.coMarketingRecommendation.alignment}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPartner(null);
                      setStep(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Find Target Accounts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Target account matching',
      content: (
        <div>
          <div className="p-4 bg-brand-background bg-opacity-20 border border-brand-border rounded-lg mb-6">
            <p className="font-semibold mb-1">Account Co-Marketing Opportunity Analysis</p>
            <p className="text-sm text-gray-300">I've identified accounts with the highest co-marketing potential based on partner relationships, previous marketing engagement, and industry alignment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Total Accounts Analyzed</div>
              <div className="text-2xl font-bold">{customerAccountData.length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">High Opportunity Accounts</div>
              <div className="text-2xl font-bold">{customerAccountData.filter((a: any) => a.coMarketingOpportunity.score >= 85).length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Potential Marketing Reach</div>
              <div className="text-2xl font-bold">{customerAccountData.reduce((sum: number, a: any) => sum + a.buyingCommittee.length, 0)} stakeholders</div>
            </div>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Account</th>
                  <th className="border border-gray-700 p-2 text-left">Industry</th>
                  <th className="border border-gray-700 p-2 text-left">Annual Revenue</th>
                  <th className="border border-gray-700 p-2 text-left">Region</th>
                  <th className="border border-gray-700 p-2 text-left">Partners</th>
                  <th className="border border-gray-700 p-2 text-left">Marketing History</th>
                  <th className="border border-gray-700 p-2 text-left">Co-Marketing Score</th>
                  <th className="border border-gray-700 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customerAccountData.sort((a: any, b: any) => b.coMarketingOpportunity.score - a.coMarketingOpportunity.score).map((account: any, index: number) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-800 ${
                      account.coMarketingOpportunity.score >= 85 ? 'bg-brand-background bg-opacity-20' : 'bg-gray-900'
                    }`}
                  >
                    <td className="border border-gray-700 p-2">{account.name}</td>
                    <td className="border border-gray-700 p-2">{account.industry}</td>
                    <td className="border border-gray-700 p-2">${(account.annualRevenue / 1000000).toFixed(1)}M</td>
                    <td className="border border-gray-700 p-2">{account.region}</td>
                    <td className="border border-gray-700 p-2">
                      <div className="flex flex-col space-y-1">
                        {account.partnerRelationships.map((pr: any, idx: number) => (
                          <div key={idx} className="flex items-center text-sm">
                            <div 
                              className={`w-2 h-2 rounded-full mr-1 ${
                                pr.strength === 'High' ? 'bg-red-500' :
                                pr.strength === 'Medium' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            ></div>
                            {pr.partnerName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">
                      {account.marketingHistory.length > 0 ? (
                        <div className="text-sm">
                          {account.marketingHistory.length} campaigns
                          <div className="text-gray-400">
                            Last: {account.marketingHistory[0].campaign}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                    <td className="border border-gray-700 p-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-brand-primary h-2.5 rounded-full" 
                            style={{ width: `${account.coMarketingOpportunity.score}%` }}
                          ></div>
                        </div>
                        <span>{account.coMarketingOpportunity.score}/100</span>
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">
                      <button
                        onClick={() => setSelectedAccount(account.name)}
                        className="px-2 py-1 bg-brand-primary text-white rounded text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedAccount && selectedAccountData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 p-4">
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Account Analysis: {selectedAccountData.name}</h3>
                  <button 
                    onClick={() => setSelectedAccount(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Industry</div>
                    <div className="font-semibold">{selectedAccountData.industry}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Annual Revenue</div>
                    <div className="font-semibold">${(selectedAccountData.annualRevenue / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Region</div>
                    <div className="font-semibold">{selectedAccountData.region}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Buying Committee</h4>
                    <div className="space-y-2">
                      {selectedAccountData.buyingCommittee.map((member: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{member.name}</div>
                            <div className="text-sm text-gray-400">{member.title}</div>
                          </div>
                          <div 
                            className={`px-2 py-1 text-xs rounded ${
                              member.influenceLevel === 'High' ? 'bg-red-900 text-red-300' :
                              member.influenceLevel === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-blue-900 text-blue-300'
                            }`}
                          >
                            {member.influenceLevel} Influence
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Partner Relationships</h4>
                    <div className="space-y-2">
                      {selectedAccountData.partnerRelationships.map((relationship: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded">
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                relationship.strength === 'High' ? 'bg-red-500' :
                                relationship.strength === 'Medium' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            ></div>
                            <div className="font-semibold">{relationship.partnerName}</div>
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            <span className="text-gray-400">Strength:</span> {relationship.strength}
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className="text-gray-400">Contacts:</span> {relationship.accountContacts.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Marketing History</h4>
                    {selectedAccountData.marketingHistory.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAccountData.marketingHistory.map((history: any, idx: number) => (
                          <div key={idx} className="p-2 bg-gray-700 rounded">
                            <div className="font-semibold">{history.campaign}</div>
                            <div className="text-sm">
                              <span className="text-gray-400">Attended:</span> {history.attended ? 'Yes' : 'No'}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Leads Generated:</span> {history.leadsGenerated}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400">No previous marketing activities</div>
                    )}
                  </div>
                  
                  <div className="bg-brand-background bg-opacity-20 border border-brand-border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Co-Marketing Recommendation</h4>
                    <div className="mb-2">
                      <div className="text-sm text-gray-400">Overall Score</div>
                      <div className="text-xl font-bold">{selectedAccountData.coMarketingOpportunity.score}/100</div>
                    </div>
                    <div className="mb-2">
                      <div className="text-sm text-gray-400">Recommended Partner</div>
                      <div className="font-semibold">{selectedAccountData.coMarketingOpportunity.recommendedPartner}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Reason</div>
                      <div className="text-sm">{selectedAccountData.coMarketingOpportunity.reasonCode}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedAccount(null)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAccount(null);
                      setStep(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Plan Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Campaign planning',
      content: (
        <div>
          <div className="p-4 bg-brand-background bg-opacity-20 border border-brand-border rounded-lg mb-6">
            <p className="font-semibold mb-1">Campaign Strategy Recommendations</p>
            <p className="text-sm text-gray-300">Based on my analysis, here are recommended campaign templates that align with your top co-marketing opportunities.</p>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Campaign Template</th>
                  <th className="border border-gray-700 p-2 text-left">Type</th>
                  <th className="border border-gray-700 p-2 text-left">Format</th>
                  <th className="border border-gray-700 p-2 text-left">Budget</th>
                  <th className="border border-gray-700 p-2 text-left">Expected Results</th>
                  <th className="border border-gray-700 p-2 text-left">Timeline</th>
                  <th className="border border-gray-700 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketingCampaignTemplates.map((template: any, index: number) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-800 bg-gray-900"
                  >
                    <td className="border border-gray-700 p-2">{template.name}</td>
                    <td className="border border-gray-700 p-2">{template.type}</td>
                    <td className="border border-gray-700 p-2">{template.format}</td>
                    <td className="border border-gray-700 p-2">${template.requiredResources.budget.toLocaleString()}</td>
                    <td className="border border-gray-700 p-2">
                      <div className="text-sm">
                        <div>{template.typicalResults.leads} leads</div>
                        <div>{Math.round(template.typicalResults.conversionRate * 100)}% conversion</div>
                        <div>${template.typicalResults.costPerLead} cost per lead</div>
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">
                      <div className="text-sm">
                        <div>{template.requiredResources.planningTimeWeeks} weeks planning</div>
                        <div>{template.requiredResources.executionTimeWeeks} weeks execution</div>
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">
                      <button
                        onClick={() => setSelectedTemplate(template.id)}
                        className="px-2 py-1 bg-brand-primary text-white rounded text-sm"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedTemplate && selectedTemplateData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 p-4">
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Campaign Plan: {selectedTemplateData.name}</h3>
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Campaign Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span>{selectedTemplateData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Format:</span>
                        <span>{selectedTemplateData.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span>{selectedTemplateData.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Budget:</span>
                        <span>${selectedTemplateData.requiredResources.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Planning Time:</span>
                        <span>{selectedTemplateData.requiredResources.planningTimeWeeks} weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Execution Time:</span>
                        <span>{selectedTemplateData.requiredResources.executionTimeWeeks} weeks</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Expected Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected Leads:</span>
                        <span>{selectedTemplateData.typicalResults.leads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Conversion Rate:</span>
                        <span>{Math.round(selectedTemplateData.typicalResults.conversionRate * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cost Per Lead:</span>
                        <span>${selectedTemplateData.typicalResults.costPerLead}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potential Opportunities:</span>
                        <span>{Math.round(selectedTemplateData.typicalResults.leads * selectedTemplateData.typicalResults.conversionRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potential Revenue:</span>
                        <span>${(Math.round(selectedTemplateData.typicalResults.leads * selectedTemplateData.typicalResults.conversionRate) * 100000).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span>{Math.round((Math.round(selectedTemplateData.typicalResults.leads * selectedTemplateData.typicalResults.conversionRate) * 100000) / selectedTemplateData.requiredResources.budget)}x</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Success Factors</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedTemplateData.successFactors.map((factor: string, idx: number) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommended Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplateData.recommendedIndustries.includes('All') ? (
                        <div className="px-2 py-1 bg-brand-background text-brand-light rounded text-sm">All Industries</div>
                      ) : (
                        selectedTemplateData.recommendedIndustries.map((industry: string, idx: number) => (
                          <div key={idx} className="px-2 py-1 bg-brand-background text-brand-light rounded text-sm">
                            {industry}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-brand-background bg-opacity-20 border border-brand-border p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">Recommended Implementation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Recommended Partner</div>
                      <div className="font-semibold">TechConsult Partners</div>
                      <div className="text-sm mt-1">
                        High co-marketing score (92/100) and available marketing fund of $48,750
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Target Accounts</div>
                      <div className="font-semibold">GlobalRetail, AlphaBank, Acme Corp</div>
                      <div className="text-sm mt-1">
                        Matching industries and existing partner relationships
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setStep(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Campaign summary',
      content: (
        <div>
          <div className="p-4 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🎉</div>
              <div>
                <p className="font-semibold text-lg mb-1">Co-Marketing Campaign Created</p>
                <p className="text-gray-300">Your co-marketing campaign has been created. Here's a summary of the plan.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 border-b border-gray-700 pb-2">Campaign Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Campaign Name:</span>
                  <span>Industry-Specific Webinar Series</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Partner:</span>
                  <span>TechConsult Partners</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Industries:</span>
                  <span>Financial Services, Retail</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget:</span>
                  <span>$15,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timeline:</span>
                  <span>7 weeks (4 planning, 3 execution)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Date:</span>
                  <span>May 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Date:</span>
                  <span>July 3, 2025</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 border-b border-gray-700 pb-2">Target Accounts</h4>
              <div className="space-y-3">
                <div className="p-2 bg-gray-900 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">GlobalRetail</div>
                    <div className="text-sm text-gray-400">Retail</div>
                  </div>
                  <div className="text-sm bg-brand-background text-brand-light px-2 py-1 rounded">
                    92% Match
                  </div>
                </div>
                <div className="p-2 bg-gray-900 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">AlphaBank</div>
                    <div className="text-sm text-gray-400">Financial Services</div>
                  </div>
                  <div className="text-sm bg-brand-background text-brand-light px-2 py-1 rounded">
                    90% Match
                  </div>
                </div>
                <div className="p-2 bg-gray-900 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">Acme Corp</div>
                    <div className="text-sm text-gray-400">Manufacturing</div>
                  </div>
                  <div className="text-sm bg-brand-background text-brand-light px-2 py-1 rounded">
                    85% Match
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 border-b border-gray-700 pb-2">Expected Results</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold">80</div>
                  <div className="text-sm text-gray-400">Expected Leads</div>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold">12%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold">9-10</div>
                  <div className="text-sm text-gray-400">Potential Opportunities</div>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold">6.7x</div>
                  <div className="text-sm text-gray-400">Estimated ROI</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 border-b border-gray-700 pb-2">Action Items</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center mr-2 flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold">Schedule kickoff meeting with TechConsult Partners</p>
                    <p className="text-sm text-gray-400">Contact: Jennifer Martinez (Marketing Director)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center mr-2 flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold">Define webinar topics and speakers</p>
                    <p className="text-sm text-gray-400">Due by: May 22, 2025</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center mr-2 flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold">Create joint marketing budget proposal</p>
                    <p className="text-sm text-gray-400">Due by: May 29, 2025</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center mr-2 flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold">Develop campaign assets and promotion plan</p>
                    <p className="text-sm text-gray-400">Due by: June 12, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Complete Campaign Planning
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
            className="absolute h-1 bg-brand-primary rounded transition-all duration-500"
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  i < step ? 'bg-red-600' : i === step ? 'bg-brand-primary' : 'bg-gray-700'
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
      {step < steps.length - 1 && (
        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          )}
          {step === 0 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="ml-auto px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              Start Analysis
            </button>
          ) : (
            <button
              onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
              className={`${step === 0 ? 'ml-auto' : ''} px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors`}
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
};