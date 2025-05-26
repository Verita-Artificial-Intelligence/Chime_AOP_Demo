import { useState } from 'react';
import { partnerDeals, partnerDealTrends, recommendedActions } from '../data/dealMonitoringData';

export const DealMonitoringExecution = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  
  const filteredDeals = atRiskOnly 
    ? partnerDeals.filter(deal => deal.healthIndicators.overall === 'At Risk')
    : partnerDeals;
  
  const selectedDealData = partnerDeals.find(deal => deal.id === selectedDeal);

  const steps = [
    {
      title: 'Analyzing request',
      content: (
        <div>
          <p className="mb-4">I'll help you monitor the status of your partner-related deals. Let me analyze the current state of these opportunities.</p>
          <div className="animate-pulse mt-6 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      )
    },
    {
      title: 'Deal overview',
      content: (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold">Partner Deal Status</h4>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="at-risk-filter" 
                className="h-4 w-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
                checked={atRiskOnly}
                onChange={(e) => setAtRiskOnly(e.target.checked)}
              />
              <label htmlFor="at-risk-filter" className="ml-2 text-sm">Show only at-risk deals</label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Active Partner Deals</div>
              <div className="text-2xl font-bold">{partnerDeals.length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">At Risk Deals</div>
              <div className="text-2xl font-bold text-red-400">{partnerDeals.filter(d => d.healthIndicators.overall === 'At Risk').length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Total Partner Pipeline</div>
              <div className="text-2xl font-bold">${partnerDeals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Avg. Days in Stage</div>
              <div className="text-2xl font-bold">{Math.round(partnerDeals.reduce((sum, deal) => sum + deal.stage.daysInCurrentStage, 0) / partnerDeals.length)}</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Opportunity</th>
                  <th className="border border-gray-700 p-2 text-left">Customer</th>
                  <th className="border border-gray-700 p-2 text-left">Stage</th>
                  <th className="border border-gray-700 p-2 text-left">Status</th>
                  <th className="border border-gray-700 p-2 text-left">Value</th>
                  <th className="border border-gray-700 p-2 text-left">Close Date</th>
                  <th className="border border-gray-700 p-2 text-left">Partners</th>
                  <th className="border border-gray-700 p-2 text-left">Health</th>
                  <th className="border border-gray-700 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal, index) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-800 ${
                      deal.healthIndicators.overall === 'At Risk' ? 'bg-red-900 bg-opacity-20' : 
                      deal.healthIndicators.overall === 'Neutral' ? 'bg-yellow-900 bg-opacity-10' : 
                      'bg-gray-900'
                    }`}
                  >
                    <td className="border border-gray-700 p-2">{deal.name}</td>
                    <td className="border border-gray-700 p-2">{deal.customer}</td>
                    <td className="border border-gray-700 p-2">{deal.stage.current}</td>
                    <td className="border border-gray-700 p-2">
                      <div className="flex items-center">
                        <div 
                          className={`w-3 h-3 rounded-full mr-2 ${
                            deal.stage.status === 'At Risk' ? 'bg-red-500' :
                            deal.stage.status === 'On Track' ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                        ></div>
                        {deal.stage.status}
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">${deal.value.toLocaleString()}</td>
                    <td className="border border-gray-700 p-2">{deal.closeDate}</td>
                    <td className="border border-gray-700 p-2">
                      {deal.partners.map((p, i) => (
                        <div key={i} className="text-sm">
                          {p.name}
                          <span className={`ml-1 px-1 text-xs rounded ${
                            p.engagement === 'High' ? 'bg-red-900 text-red-300' :
                            p.engagement === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {p.engagement}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="border border-gray-700 p-2">
                      <div className={`px-2 py-1 text-xs rounded text-center ${
                        deal.healthIndicators.overall === 'At Risk' ? 'bg-red-900 text-red-300' :
                        deal.healthIndicators.overall === 'Neutral' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {deal.healthIndicators.overall}
                      </div>
                    </td>
                    <td className="border border-gray-700 p-2">
                      <button
                        onClick={() => setSelectedDeal(deal.id)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedDeal && selectedDealData && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 p-4">
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{selectedDealData.name} - {selectedDealData.customer}</h3>
                  <button 
                    onClick={() => setSelectedDeal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Stage</div>
                    <div className="font-semibold">{selectedDealData.stage.current}</div>
                    <div className="text-sm text-gray-400 mt-1">Previous: {selectedDealData.stage.previous}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Value</div>
                    <div className="font-semibold">${selectedDealData.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {selectedDealData.probability * 100}% Probability
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Health</div>
                    <div className={`font-semibold ${
                      selectedDealData.healthIndicators.overall === 'At Risk' ? 'text-red-400' :
                      selectedDealData.healthIndicators.overall === 'Neutral' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedDealData.healthIndicators.overall}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Last Updated: {selectedDealData.lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Stage Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Days in current stage:</span>
                        <span className={selectedDealData.stage.daysInCurrentStage > selectedDealData.stage.averageDaysInStage ? 'text-red-400' : ''}>
                          {selectedDealData.stage.daysInCurrentStage} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average for this stage:</span>
                        <span>{selectedDealData.stage.averageDaysInStage} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`${
                          selectedDealData.stage.status === 'At Risk' ? 'text-red-400' :
                          selectedDealData.stage.status === 'On Track' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {selectedDealData.stage.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Health Indicators</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Communication:</span>
                        <span className={`${
                          selectedDealData.healthIndicators.communication === 'At Risk' ? 'text-red-400' :
                          selectedDealData.healthIndicators.communication === 'Neutral' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {selectedDealData.healthIndicators.communication}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Momentum:</span>
                        <span className={`${
                          selectedDealData.healthIndicators.momentum === 'At Risk' ? 'text-red-400' :
                          selectedDealData.healthIndicators.momentum === 'Neutral' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {selectedDealData.healthIndicators.momentum}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Competitive Position:</span>
                        <span className={`${
                          selectedDealData.healthIndicators.competitivePosition === 'At Risk' ? 'text-red-400' :
                          selectedDealData.healthIndicators.competitivePosition === 'Neutral' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {selectedDealData.healthIndicators.competitivePosition}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Partner Involvement</h4>
                    <div className="space-y-3">
                      {selectedDealData.partners.map((partner, idx) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded">
                          <div className="font-semibold">{partner.name}</div>
                          <div className="text-sm text-gray-300">Role: {partner.role}</div>
                          <div className="text-sm text-gray-300">Last Activity: {partner.lastActivity}</div>
                          <div className="text-sm text-gray-300">
                            Next Activity: {partner.nextActivity}
                          </div>
                          <div className="text-sm mt-1">
                            Engagement: 
                            <span className={`ml-1 px-1 text-xs rounded ${
                              partner.engagement === 'High' ? 'bg-red-900 text-red-300' :
                              partner.engagement === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {partner.engagement}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Stakeholders</h4>
                    <div className="space-y-3">
                      {selectedDealData.stakeholders.map((stakeholder, idx) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded">
                          <div className="font-semibold">{stakeholder.name}</div>
                          <div className="text-sm text-gray-300">Title: {stakeholder.title}</div>
                          <div className="text-sm text-gray-300">
                            Last Contact: {stakeholder.lastContact}
                          </div>
                          <div className="text-sm mt-1">
                            Sentiment: 
                            <span className={`ml-1 px-1 text-xs rounded ${
                              stakeholder.sentiment === 'Positive' ? 'bg-red-900 text-red-300' :
                              stakeholder.sentiment === 'Neutral' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {stakeholder.sentiment}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {selectedDealData.riskFactors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">Risk Factors</h4>
                    <div className="space-y-3">
                      {selectedDealData.riskFactors.map((risk, idx) => (
                        <div key={idx} className="p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg">
                          <div className="font-semibold flex items-center">
                            <span className="mr-2">⚠️</span>
                            {risk.type}
                            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                              risk.severity === 'High' ? 'bg-red-900 text-red-300' :
                              risk.severity === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-blue-900 text-blue-300'
                            }`}>
                              {risk.severity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-300 mt-1">{risk.description}</div>
                          <div className="text-sm text-gray-300 mt-1">
                            <span className="text-gray-400">Mitigation Plan:</span> {risk.mitigationPlan}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Assign Actions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Deal analysis',
      content: (
        <div>
          <h4 className="text-xl font-semibold mb-4">Partner Deal Trends Analysis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Stage Progression</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Discovery</span>
                  <div className="w-2/3 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full" 
                      style={{ width: `${(partnerDealTrends.stageProgression.averageDaysInDiscovery / partnerDealTrends.stageProgression.totalAverageSalesCycle) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right">{partnerDealTrends.stageProgression.averageDaysInDiscovery} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Proposal</span>
                  <div className="w-2/3 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full" 
                      style={{ width: `${(partnerDealTrends.stageProgression.averageDaysInProposal / partnerDealTrends.stageProgression.totalAverageSalesCycle) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right">{partnerDealTrends.stageProgression.averageDaysInProposal} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Negotiation</span>
                  <div className="w-2/3 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full" 
                      style={{ width: `${(partnerDealTrends.stageProgression.averageDaysInNegotiation / partnerDealTrends.stageProgression.totalAverageSalesCycle) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right">{partnerDealTrends.stageProgression.averageDaysInNegotiation} days</span>
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-4">
                <span className="font-semibold text-white">Note:</span> {partnerDealTrends.stageProgression.dealsStuckInStage} deals are currently stuck in stage (exceeding 150% of average time).
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Partner Engagement Impact</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>High Engagement</span>
                  <div className="w-2/3 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-600 h-full" 
                      style={{ width: `${partnerDealTrends.partnerEngagement.highEngagementWinRate * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right">{Math.round(partnerDealTrends.partnerEngagement.highEngagementWinRate * 100)}% win</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Medium Engagement</span>
                  <div className="w-2/3 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-600 h-full" 
                      style={{ width: `${partnerDealTrends.partnerEngagement.mediumEngagementWinRate * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right">{Math.round(partnerDealTrends.partnerEngagement.mediumEngagementWinRate * 100)}% win</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Low Engagement</span>
                  <div className="w-2/3 bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-600 h-full" 
                      style={{ width: `${partnerDealTrends.partnerEngagement.lowEngagementWinRate * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right">{Math.round(partnerDealTrends.partnerEngagement.lowEngagementWinRate * 100)}% win</span>
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-4">
                <span className="font-semibold text-white">Insight:</span> High partner engagement correlates to {Math.round((partnerDealTrends.partnerEngagement.highEngagementWinRate / partnerDealTrends.partnerEngagement.lowEngagementWinRate) * 100) / 100}x higher win rates.
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Communication Impact</h5>
              <div className="flex items-center justify-center h-36">
                <div className="text-center mx-2">
                  <div className="w-32 h-32 rounded-full border-8 border-blue-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{partnerDealTrends.communicationPatterns.dealsWithRegularCommunication}</div>
                      <div className="text-sm">Regular Comm.</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    {Math.round(partnerDealTrends.communicationPatterns.regularCommunicationWinRate * 100)}% Win Rate
                  </div>
                </div>
                <div className="text-4xl font-light text-gray-500 mx-2">vs</div>
                <div className="text-center mx-2">
                  <div className="w-32 h-32 rounded-full border-8 border-red-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{partnerDealTrends.communicationPatterns.dealsWithIrregularCommunication}</div>
                      <div className="text-sm">Irregular Comm.</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    {Math.round(partnerDealTrends.communicationPatterns.irregularCommunicationWinRate * 100)}% Win Rate
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Deal Health Distribution</h5>
              <div className="flex items-center justify-around h-36 space-x-4">
                <div className="text-center">
                  <div 
                    className="mx-auto rounded-full border border-gray-600"
                    style={{ 
                      width: `${60 * (partnerDealTrends.overallHealth.healthy / (partnerDealTrends.overallHealth.healthy + partnerDealTrends.overallHealth.neutral + partnerDealTrends.overallHealth.atRisk))}px`,
                      height: `${60 * (partnerDealTrends.overallHealth.healthy / (partnerDealTrends.overallHealth.healthy + partnerDealTrends.overallHealth.neutral + partnerDealTrends.overallHealth.atRisk))}px`,
                      backgroundColor: '#10B981',
                      minWidth: '30px',
                      minHeight: '30px'
                    }}
                  ></div>
                  <div className="mt-2">
                    <div className="font-semibold">{partnerDealTrends.overallHealth.healthy}</div>
                    <div className="text-sm text-gray-400">Healthy</div>
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="mx-auto rounded-full border border-gray-600"
                    style={{ 
                      width: `${60 * (partnerDealTrends.overallHealth.neutral / (partnerDealTrends.overallHealth.healthy + partnerDealTrends.overallHealth.neutral + partnerDealTrends.overallHealth.atRisk))}px`,
                      height: `${60 * (partnerDealTrends.overallHealth.neutral / (partnerDealTrends.overallHealth.healthy + partnerDealTrends.overallHealth.neutral + partnerDealTrends.overallHealth.atRisk))}px`,
                      backgroundColor: '#FBBF24',
                      minWidth: '30px',
                      minHeight: '30px'
                    }}
                  ></div>
                  <div className="mt-2">
                    <div className="font-semibold">{partnerDealTrends.overallHealth.neutral}</div>
                    <div className="text-sm text-gray-400">Neutral</div>
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="mx-auto rounded-full border border-gray-600"
                    style={{ 
                      width: `${60 * (partnerDealTrends.overallHealth.atRisk / (partnerDealTrends.overallHealth.healthy + partnerDealTrends.overallHealth.neutral + partnerDealTrends.overallHealth.atRisk))}px`,
                      height: `${60 * (partnerDealTrends.overallHealth.atRisk / (partnerDealTrends.overallHealth.healthy + partnerDealTrends.overallHealth.neutral + partnerDealTrends.overallHealth.atRisk))}px`,
                      backgroundColor: '#EF4444',
                      minWidth: '30px',
                      minHeight: '30px'
                    }}
                  ></div>
                  <div className="mt-2">
                    <div className="font-semibold">{partnerDealTrends.overallHealth.atRisk}</div>
                    <div className="text-sm text-gray-400">At Risk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Recommended actions',
      content: (
        <div>
          <h4 className="text-xl font-semibold mb-6">Recommended Actions</h4>
          
          <div className="mb-8">
            <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="text-3xl mr-4">💡</div>
                <div>
                  <p className="font-semibold text-lg mb-1">Partner Deal Momentum Insights</p>
                  <p className="text-gray-300">Based on my analysis of your partner-related deals, I've identified several opportunities to improve deal momentum and conversion rates.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {recommendedActions.map((action, idx) => {
                const deal = partnerDeals.find(d => d.id === action.opportunity);
                return (
                  <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h5 className="font-semibold">{action.action}</h5>
                      <div 
                        className={`px-2 py-1 text-xs rounded ${
                          action.impact === 'High' ? 'bg-red-900 text-red-300' :
                          action.impact === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-blue-900 text-blue-300'
                        }`}
                      >
                        {action.impact} Impact
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Opportunity</div>
                        <div>{deal?.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Assign To</div>
                        <div>{action.assignTo}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Due Date</div>
                        <div>{action.dueDate}</div>
                      </div>
                      <div className="md:text-right">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm mt-2 md:mt-0">
                          Assign
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">
                      <span className="text-gray-400">Note:</span> {action.notes}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Complete Analysis
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Analysis
            </button>
          ) : (
            <button
              onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
};