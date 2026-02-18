import React, { useState } from 'react';
import { Video, Users, MessageSquare, Target, Award, Briefcase, CheckSquare, Users2, Database, Link, PlayCircle } from 'lucide-react';

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
    scoringWorks: 'https://youtu.be/scoring-purchase',
    scoreBetter: 'https://youtu.be/improve-purchase',
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
    scoringWorks: 'https://youtu.be/scoring-hr',
    scoreBetter: 'https://youtu.be/improve-hr',
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
    scoringWorks: 'https://youtu.be/scoring-ea',
    scoreBetter: 'https://youtu.be/improve-ea',
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
    scoringWorks: 'https://youtu.be/scoring-sales',
    scoreBetter: 'https://youtu.be/improve-sales',
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
    scoringWorks: 'https://youtu.be/scoring-audit',
    scoreBetter: 'https://youtu.be/improve-audit',
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
    scoringWorks: 'https://youtu.be/scoring-finance',
    scoreBetter: 'https://youtu.be/improve-finance',
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

const KpiKra = () => {
  const [selectedDesignation, setSelectedDesignation] = useState('CRM');
  const currentData = designationData[selectedDesignation];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">KPI & KRA Dashboard</h1>
              <p className="text-blue-100 mt-1 text-sm md:text-base">Performance metrics and role information</p>
            </div>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
            >
              {designations.map((designation) => (
                <option key={designation} value={designation} className="text-gray-900">
                  {designation}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Role Information Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-4 md:p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Role Details</h2>
            </div>
            <div className="bg-white rounded-lg p-3 md:p-4 border border-blue-100">
              <h3 className="text-xs md:text-sm font-medium text-blue-600 mb-2">Actual Role</h3>
              <p className="text-sm md:text-base text-gray-800">{currentData.actualRole}</p>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-md border border-emerald-100 p-4 md:p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Task Overview</h2>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 border border-emerald-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-emerald-600">{currentData.totalTasks.split(' ')[0]}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Daily Tasks</p>
              </div>
            </div>
          </div>

          {/* Scoring Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md border border-purple-100 p-4 md:p-6 transform transition-all hover:scale-[1.02] md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
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
                  <Video className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs md:text-sm font-medium text-purple-600">How Scoring Works</span>
                </div>
              </a>
              <a 
                href={currentData.scoreBetter}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-3 md:p-4 border border-purple-100 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs md:text-sm font-medium text-purple-600">How To Score Better</span>
                </div>
              </a>
            </div>
          </div>

          {/* Communication Section - Full Width */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Team Communication Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md border border-amber-100 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users2 className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Team Communication</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-amber-100">
                  <h3 className="text-xs md:text-sm font-medium text-amber-600 mb-3">Communication Team</h3>
                  <ul className="space-y-2">
                    {currentData.communicationTeam.map((member, index) => (
                      <li key={index} className="flex items-start md:items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <Users className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 md:mt-0" />
                        <span className="text-xs md:text-sm text-gray-700">{member}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Communication Process Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-md border border-cyan-100 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Communication Process</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-cyan-100">
                  <h3 className="text-xs md:text-sm font-medium text-cyan-600 mb-2">How to Communicate</h3>
                  <p className="text-xs md:text-sm text-gray-700">{currentData.howToCommunicate}</p>
                </div>
                <div className="bg-white rounded-lg p-3 md:p-4 border border-cyan-100">
                  <h3 className="text-xs md:text-sm font-medium text-cyan-600 mb-2">Key Person</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-700">{currentData.keyPerson}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Systems Table - Full Width */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Systems and Resources</h2>
              </div>
            </div>
            
            {/* Mobile View - Cards */}
            <div className="block md:hidden">
              {currentData.systems.map((system, index) => (
                <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">System Name</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{system.systemName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Task Name</p>
                      <p className="text-sm text-gray-700 mt-1">{system.taskName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Description</p>
                      <p className="text-sm text-gray-700 mt-1">{system.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Resources</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={system.systemLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          <Link className="w-3.5 h-3.5" />
                          <span>System</span>
                        </a>
                        <a
                          href={system.dbLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-medium"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </a>
                        <a
                          href={system.trainingVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Training</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
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
                        <div className="text-sm text-gray-700">{system.taskName}</div>
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

export default KpiKra;