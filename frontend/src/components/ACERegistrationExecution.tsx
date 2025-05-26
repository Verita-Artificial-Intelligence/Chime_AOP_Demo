import { useState } from 'react';
import { 
  unregisteredOpportunities, 
  awsAccountManagers, 
  awsServices, 
  registrationHistory, 
  registrationMetrics 
} from '../data/aceRegistrationData';

export const ACERegistrationExecution = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [registrationForm, setRegistrationForm] = useState({
    awsAccountManager: '',
    awsServices: [] as string[],
    awsAccountId: '',
    estimatedAwsRevenue: 0,
    notes: ''
  });
  
  const selectedOpp = unregisteredOpportunities.find(opp => opp.id === selectedOpportunity);

  const steps = [
    {
      title: 'Analyzing request',
      content: (
        <div>
          <p className="mb-4">I'll help you register your AWS deals in ACE. Let me first identify eligible opportunities in your pipeline.</p>
          <div className="animate-pulse mt-6 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      )
    },
    {
      title: 'Eligible opportunities',
      content: (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Eligible for Registration</div>
              <div className="text-2xl font-bold">{unregisteredOpportunities.length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Previously Registered (Q2)</div>
              <div className="text-2xl font-bold">{registrationMetrics.currentQuarter.registered}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Potential AWS Revenue</div>
              <div className="text-2xl font-bold">
                ${unregisteredOpportunities.reduce((sum, opp) => sum + opp.awsValue, 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <p className="mb-4">I've identified the following opportunities that are eligible for AWS ACE registration:</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Opportunity</th>
                  <th className="border border-gray-700 p-2 text-left">Customer</th>
                  <th className="border border-gray-700 p-2 text-left">Value</th>
                  <th className="border border-gray-700 p-2 text-left">Est. AWS Value</th>
                  <th className="border border-gray-700 p-2 text-left">Stage</th>
                  <th className="border border-gray-700 p-2 text-left">Close Date</th>
                  <th className="border border-gray-700 p-2 text-left">Required Fields</th>
                  <th className="border border-gray-700 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unregisteredOpportunities.map((opp, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="border border-gray-700 p-2">{opp.name}</td>
                    <td className="border border-gray-700 p-2">{opp.customer}</td>
                    <td className="border border-gray-700 p-2">${opp.value.toLocaleString()}</td>
                    <td className="border border-gray-700 p-2">${opp.awsValue.toLocaleString()}</td>
                    <td className="border border-gray-700 p-2">{opp.stage}</td>
                    <td className="border border-gray-700 p-2">{opp.closeDate}</td>
                    <td className="border border-gray-700 p-2">
                      <div className={`px-2 py-1 text-xs rounded text-center ${
                        opp.requiredACEFields.complete ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {opp.requiredACEFields.complete ? 'Complete' : 'Missing Fields'}
                      </div>
                      {!opp.requiredACEFields.complete && (
                        <div className="text-xs mt-1 text-gray-400">
                          Missing: {opp.requiredACEFields.missing.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-700 p-2">
                      <button
                        onClick={() => setSelectedOpportunity(opp.id)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Register
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Registration History</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Current Quarter Registrations:</span>
                  <span>{registrationMetrics.currentQuarter.registered}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Current Quarter Approvals:</span>
                  <span>{registrationMetrics.currentQuarter.approved}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Current Quarter Value:</span>
                  <span>${registrationMetrics.currentQuarter.totalValue.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Previous Quarter Registrations:</span>
                  <span>{registrationMetrics.previousQuarter.registered}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Registration Growth:</span>
                  <span className="text-red-400">+{Math.round(registrationMetrics.trendsThisQuarter.registrationGrowth * 100)}%</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Approval Rate:</span>
                  <span>{Math.round(registrationMetrics.trendsThisQuarter.approvalRate * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {selectedOpportunity && selectedOpp && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 p-4">
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Register in AWS ACE: {selectedOpp.name}</h3>
                  <button 
                    onClick={() => setSelectedOpportunity(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Customer</div>
                    <div className="font-semibold">{selectedOpp.customer}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Opportunity Value</div>
                    <div className="font-semibold">${selectedOpp.value.toLocaleString()}</div>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">AWS Account Manager</label>
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={registrationForm.awsAccountManager}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, awsAccountManager: e.target.value }))}
                    >
                      <option value="">Select AWS Account Manager</option>
                      {awsAccountManagers.filter(am => am.region === selectedOpp.region).map((am, idx) => (
                        <option key={idx} value={am.name}>{am.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">AWS Account ID</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 123456789012"
                      value={registrationForm.awsAccountId}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, awsAccountId: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">AWS Services (select all that apply)</label>
                    <div className="max-h-40 overflow-y-auto p-2 bg-gray-800 border border-gray-700 rounded-lg">
                      {awsServices.map((service, idx) => (
                        <div key={idx} className="flex items-center mb-1">
                          <input 
                            type="checkbox" 
                            id={`service-${idx}`}
                            checked={registrationForm.awsServices.includes(service.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRegistrationForm(prev => ({ ...prev, awsServices: [...prev.awsServices, service.name] }));
                              } else {
                                setRegistrationForm(prev => ({ 
                                  ...prev, 
                                  awsServices: prev.awsServices.filter(s => s !== service.name) 
                                }));
                              }
                            }}
                            className="h-4 w-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
                          />
                          <label htmlFor={`service-${idx}`} className="ml-2 text-sm">
                            {service.name}
                            {service.popular && (
                              <span className="ml-1 px-1 text-xs bg-blue-900 text-blue-300 rounded">Popular</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated AWS Revenue</label>
                    <input 
                      type="number" 
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 100000"
                      value={registrationForm.estimatedAwsRevenue || selectedOpp.awsValue}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, estimatedAwsRevenue: Number(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Additional Notes</label>
                    <textarea 
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any relevant details about this opportunity..."
                      value={registrationForm.notes}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, notes: e.target.value }))}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setSelectedOpportunity(null)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedOpportunity(null);
                        setRegistrationForm({
                          awsAccountManager: '',
                          awsServices: [],
                          awsAccountId: '',
                          estimatedAwsRevenue: 0,
                          notes: ''
                        });
                        setStep(prev => prev + 1);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Registration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Registration processing',
      content: (
        <div>
          <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">⏳</div>
              <div>
                <p className="font-semibold text-lg mb-1">Processing ACE Registration</p>
                <p className="text-gray-300">Your registration is being processed. This typically takes 1-2 business days for approval.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Registration Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Opportunity</div>
                  <div className="font-semibold">Acme Cloud Migration</div>
                </div>
                <div>
                  <div className="text-gray-400">Customer</div>
                  <div>Acme Corp</div>
                </div>
                <div>
                  <div className="text-gray-400">ACE Registration ID</div>
                  <div>ACE-4003</div>
                </div>
                <div>
                  <div className="text-gray-400">Submission Date</div>
                  <div>May 4, 2025</div>
                </div>
                <div>
                  <div className="text-gray-400">AWS Account Manager</div>
                  <div>Emily Zhang</div>
                </div>
                <div>
                  <div className="text-gray-400">Estimated AWS Revenue</div>
                  <div>$195,000</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-400">AWS Services</div>
                  <div>Amazon S3, Amazon EC2, AWS Lambda, Amazon RDS</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Next Steps</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold">AWS Review</p>
                    <p className="text-sm text-gray-400">AWS will review the registration to confirm eligibility and details.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold">Status Update</p>
                    <p className="text-sm text-gray-400">You'll receive a notification when the status changes.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold">AWS Engagement</p>
                    <p className="text-sm text-gray-400">Once approved, AWS Account Manager Emily Zhang will reach out to coordinate engagement.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">CRM Update Status</h4>
              <div className="flex items-center">
                <div className="w-6 h-6 text-red-500 mr-2">✓</div>
                <span>ACE registration ID added to CRM opportunity</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 text-red-500 mr-2">✓</div>
                <span>AWS Account Manager assigned in CRM</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 text-red-500 mr-2">✓</div>
                <span>AWS Services documented in CRM</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 text-red-500 mr-2">✓</div>
                <span>ACE Registration status field updated</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Registration summary',
      content: (
        <div>
          <div className="p-4 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🎉</div>
              <div>
                <p className="font-semibold text-lg mb-1">Registration Successfully Submitted</p>
                <p className="text-gray-300">Your AWS ACE registration has been successfully submitted and your CRM has been updated.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Registration Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-gray-400">Opportunities Registered</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold">$195,000</div>
                <div className="text-sm text-gray-400">Estimated AWS Revenue</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold">May 6, 2025</div>
                <div className="text-sm text-gray-400">Expected Approval Date</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-white">Tip:</span> AWS registrations typically have a {Math.round(registrationMetrics.trendsThisQuarter.approvalRate * 100)}% approval rate and take an average of {registrationMetrics.trendsThisQuarter.avgProcessingTime} days to process.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Remaining Opportunities</h4>
              <div className="space-y-2">
                {unregisteredOpportunities.slice(1).map((opp, idx) => (
                  <div key={idx} className="p-2 bg-gray-900 rounded flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{opp.name}</div>
                      <div className="text-sm text-gray-400">{opp.customer}</div>
                    </div>
                    <div className="text-right">
                      <div>${opp.awsValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">{opp.closeDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">AWS Engagement Recommendations</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-900 rounded">
                  <div className="font-semibold">Schedule Solution Workshop</div>
                  <div className="text-sm text-gray-300">
                    AWS Account Manager Emily Zhang specializes in Migration projects and could provide valuable technical guidance.
                  </div>
                  <div className="mt-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                      Schedule Meeting
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-gray-900 rounded">
                  <div className="font-semibold">Request AWS Solution Architect</div>
                  <div className="text-sm text-gray-300">
                    For complex migrations, an AWS Solution Architect can provide detailed technical design assistance.
                  </div>
                  <div className="mt-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                      Request SA
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-gray-900 rounded">
                  <div className="font-semibold">AWS Marketplace Promotion</div>
                  <div className="text-sm text-gray-300">
                    Acme Corp is eligible for AWS Marketplace incentives when purchasing through AWS Marketplace.
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
              Complete Registration
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
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Eligible Opportunities
            </button>
          ) : (
            <button
              onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
              className={`${step === 0 ? 'ml-auto' : ''} px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
};