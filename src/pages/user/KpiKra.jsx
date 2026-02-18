import React, { useState } from 'react';
import { Video, Users, MessageSquare, Target, Briefcase, CheckSquare, Database, Link, PlayCircle } from 'lucide-react';

const designations = [
  'CRM',
  'PURCHASE',
  'HR',
  'EA',
  'SALES Coordination',
  'AUDITOR',
  'ACCOUNTANT'
];

const designationData = {
  CRM: {
    actualRole: 'Customer Relationship Management Executive',
    totalTasks: '20 daily tasks',
    scoringWorks: 'https://youtu.be/scoring-crm',
    scoreBetter: 'https://youtu.be/improve-crm',
    keyPerson: 'Jayant Pandey (Marketing Manager)',
    communicationTeam: [
      'Jaidhish Pessary (Director and See Sales Operation Of Group)',
      'Kavit Passary (Director and See All Operations)',
      'Deyshree (Production Incharge)',
      'Himany Pandey (Purchaser and Transport, EA)'
    ],
    howToCommunicate: 'Introduction Through EA (Himani) and Get The Number Of All and Connect With Company\'s Phone Number',
    importanceScore: 'Critical for customer satisfaction and revenue generation',
    systems: [
      {
        systemName: 'New Crr Enquiry FMS',
        taskName: 'Crr Send Offer - Hiya',
        description: 'Make Offer And Send To Customer',
        systemLink: 'https://crm.example.com/enquiry',
        dbLink: 'https://db.example.com/crm',
        trainingVideo: 'https://youtu.be/l_sZZsU0dHU'
      },
      {
        systemName: 'New Order To Collection Fms Pmmp',
        taskName: 'Order Received',
        description: 'Received The Purchase Order Of Customer In System',
        systemLink: 'https://crm.example.com/orders',
        dbLink: 'https://db.example.com/orders',
        trainingVideo: 'https://youtu.be/FqR89slcsb8'
      }
    ]
  },
  PURCHASE: {
    actualRole: 'Procurement and Supply Chain Manager',
    totalTasks: '15 daily tasks',
    scoringWorks: 'https://youtu.be/purchase-scoring',
    scoreBetter: 'https://youtu.be/purchase-improve',
    keyPerson: 'Rajesh Kumar (Head of Procurement)',
    communicationTeam: ['Vendors', 'Logistics', 'Finance Teams'],
    howToCommunicate: 'Vendor meetings, procurement system updates, and monthly reviews',
    importanceScore: 'Critical for cost management and supply chain efficiency',
    systems: [
      {
        systemName: 'Purchase Management System',
        taskName: 'Vendor Management',
        description: 'Handle vendor relationships and procurement processes',
        systemLink: 'https://purchase.example.com',
        dbLink: 'https://db.example.com/purchase',
        trainingVideo: 'https://youtu.be/purchase-training'
      }
    ]
  },
  HR: {
    actualRole: 'Human Resources Manager',
    totalTasks: '18 daily tasks',
    scoringWorks: 'https://youtu.be/hr-scoring',
    scoreBetter: 'https://youtu.be/hr-improve',
    keyPerson: 'Priya Sharma (HR Director)',
    communicationTeam: ['All Departments', 'Management'],
    howToCommunicate: 'HR portal updates, department meetings, and employee newsletters',
    importanceScore: 'Essential for employee welfare and organizational development',
    systems: [
      {
        systemName: 'HR Management System',
        taskName: 'Employee Management',
        description: 'Handle employee records and HR processes',
        systemLink: 'https://hr.example.com',
        dbLink: 'https://db.example.com/hr',
        trainingVideo: 'https://youtu.be/hr-training'
      }
    ]
  },
  EA: {
    actualRole: 'Executive Assistant',
    totalTasks: '25 daily tasks',
    scoringWorks: 'https://youtu.be/ea-scoring',
    scoreBetter: 'https://youtu.be/ea-improve',
    keyPerson: 'Neha Gupta (Senior EA)',
    communicationTeam: ['Executive Team', 'Department Heads'],
    howToCommunicate: 'Direct communication, email updates, and calendar management',
    importanceScore: 'Critical for executive productivity and organizational coordination',
    systems: [
      {
        systemName: 'Executive Management System',
        taskName: 'Schedule Management',
        description: 'Handle executive calendars and meetings',
        systemLink: 'https://ea.example.com',
        dbLink: 'https://db.example.com/ea',
        trainingVideo: 'https://youtu.be/ea-training'
      }
    ]
  },
  'SALES Coordination': {
    actualRole: 'Sales Coordination Manager',
    totalTasks: '22 daily tasks',
    scoringWorks: 'https://youtu.be/sales-scoring',
    scoreBetter: 'https://youtu.be/sales-improve',
    keyPerson: 'Amit Patel (Sales Director)',
    communicationTeam: ['Sales Teams', 'Support Departments'],
    howToCommunicate: 'Sales meetings, coordination reports, and team updates',
    importanceScore: 'Directly impacts sales performance and team efficiency',
    systems: [
      {
        systemName: 'Sales Coordination System',
        taskName: 'Team Coordination',
        description: 'Manage sales team coordination and support',
        systemLink: 'https://sales.example.com',
        dbLink: 'https://db.example.com/sales',
        trainingVideo: 'https://youtu.be/sales-training'
      }
    ]
  },
  AUDITOR: {
    actualRole: 'Internal Auditor',
    totalTasks: '12 daily tasks',
    scoringWorks: 'https://youtu.be/audit-scoring',
    scoreBetter: 'https://youtu.be/audit-improve',
    keyPerson: 'Vikram Singh (Head of Audit)',
    communicationTeam: ['Finance Team', 'Department Heads'],
    howToCommunicate: 'Audit reports, compliance meetings, and risk assessments',
    importanceScore: 'Critical for organizational compliance and risk management',
    systems: [
      {
        systemName: 'Audit Management System',
        taskName: 'Compliance Audit',
        description: 'Conduct internal audits and compliance checks',
        systemLink: 'https://audit.example.com',
        dbLink: 'https://db.example.com/audit',
        trainingVideo: 'https://youtu.be/audit-training'
      }
    ]
  },
  ACCOUNTANT: {
    actualRole: 'Financial Accountant',
    totalTasks: '16 daily tasks',
    scoringWorks: 'https://youtu.be/finance-scoring',
    scoreBetter: 'https://youtu.be/finance-improve',
    keyPerson: 'Deepak Verma (Finance Head)',
    communicationTeam: ['Finance Department', 'Management'],
    howToCommunicate: 'Financial reports, accounting system updates, and team meetings',
    importanceScore: 'Essential for financial accuracy and organizational compliance',
    systems: [
      {
        systemName: 'Financial Management System',
        taskName: 'Financial Reporting',
        description: 'Handle financial records and reporting',
        systemLink: 'https://finance.example.com',
        dbLink: 'https://db.example.com/finance',
        trainingVideo: 'https://youtu.be/finance-training'
      }
    ]
  }
};

const UserKpiKra = () => {
  const [selectedDesignation, setSelectedDesignation] = useState('CRM');
  const currentData = designationData[selectedDesignation];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">KPI & KRA Dashboard</h1>
            <p className="text-green-100 mt-1 text-xs sm:text-sm md:text-base">Your performance metrics and role information</p>
          </div>
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
          >
            {designations.map((designation) => (
              <option key={designation} value={designation} className="text-gray-900">
                {designation}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Role Information Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Role Details</h2>
            </div>
            <div className="bg-white rounded-lg p-3 md:p-4 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-600 mb-2">Actual Role</h3>
              <p className="text-sm md:text-base text-gray-800 break-words">{currentData.actualRole}</p>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-md border border-emerald-100 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 flex-shrink-0" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Task Overview</h2>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 border border-emerald-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-emerald-600">{currentData.totalTasks.split(' ')[0]}</p>
                <p className="text-sm text-gray-600 mt-1">Daily Tasks</p>
              </div>
            </div>
          </div>

          {/* Scoring Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md border border-purple-100 p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Performance Scoring</h2>
            </div>
            <div className="space-y-3 md:space-y-4">
              <a
                href={currentData.scoringWorks}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-3 md:p-4 border border-purple-100 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm font-medium text-purple-600">How Scoring Works</span>
                </div>
              </a>
              <a
                href={currentData.scoreBetter}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-3 md:p-4 border border-purple-100 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm font-medium text-purple-600">How To Score Better</span>
                </div>
              </a>
            </div>
          </div>

          {/* Communication Section */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Team Communication Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md border border-amber-100 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0" />
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Team Communication</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-amber-100">
                  <h3 className="text-sm font-medium text-amber-600 mb-3">Communication Team</h3>
                  <ul className="space-y-2">
                    {currentData.communicationTeam.map((member, index) => (
                      <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <Users className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 break-words flex-1">{member}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Communication Process Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-md border border-cyan-100 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-cyan-600 flex-shrink-0" />
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Communication Process</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-cyan-100">
                  <h3 className="text-sm font-medium text-cyan-600 mb-2">How to Communicate</h3>
                  <p className="text-sm text-gray-700 break-words">{currentData.howToCommunicate}</p>
                </div>
                <div className="bg-white rounded-lg p-3 md:p-4 border border-cyan-100">
                  <h3 className="text-sm font-medium text-cyan-600 mb-2">Key Person</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                    </div>
                    <p className="text-sm text-gray-700 break-words flex-1">{currentData.keyPerson}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Systems Section */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 md:w-6 md:h-6 text-gray-600 flex-shrink-0" />
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Systems and Resources</h2>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden divide-y divide-gray-200">
              {currentData.systems.map((system, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">System Name</p>
                      <p className="text-sm font-semibold text-gray-900 break-words">{system.systemName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Task Name</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{system.taskName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-700 break-words">{system.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Resources</p>
                      <div className="flex flex-col gap-2">
                        <a
                          href={system.systemLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          <Link className="w-4 h-4 flex-shrink-0" />
                          <span>Open System</span>
                        </a>
                        <a
                          href={system.dbLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 active:bg-emerald-200 transition-colors text-sm font-medium"
                        >
                          <Database className="w-4 h-4 flex-shrink-0" />
                          <span>Open Dashboard</span>
                        </a>
                        <a
                          href={system.trainingVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          <PlayCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Watch Training</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentData.systems.map((system, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{system.systemName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{system.taskName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{system.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <a
                            href={system.systemLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Link className="w-4 h-4" />
                            <span className="text-sm font-medium">System</span>
                          </a>
                          <a
                            href={system.dbLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                          >
                            <Database className="w-4 h-4" />
                            <span className="text-sm font-medium">Dashboard</span>
                          </a>
                          <a
                            href={system.trainingVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Training</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserKpiKra;