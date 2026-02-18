import React, { useState } from 'react';
import { Award, CheckSquare, ClipboardList, Clock, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

// Mock Data
const employees = [
  {
    id: 'emp-001',
    name: 'Pratap Kumar',
    email: 'pratap@company.com',
    department: 'Engineering',
    designation: 'CRM',
    score: 92,
    totalTasks: 24,
    completedTasks: 21,
    pendingTasks: 3,
    weeklyCommitment: 10
  },
  {
    id: 'emp-002',
    name: 'Chetan Sharma',
    department: 'Design',
    designation: 'PURCHASE',
    score: 88,
    weeklyCommitment: 8
  }
];

const tasks = [
  {
    id: 'task-001',
    fmsName: 'Checklist & Delegation',
    taskName: 'Checklist Task-Afroj Begam',
    assignedTo: 'emp-001',
    dueDate: '2025-05-01',
    status: 'in-progress',
    priority: 'high',
    department: 'Engineering'
  },
  {
    id: 'task-002',
    fmsName: 'Checklist & Delegation',
    taskName: 'Delegation Task-Afroj Begam',
    assignedTo: 'emp-001',
    dueDate: '2025-05-01',
    status: 'completed',
    priority: 'high',
    department: 'Engineering'
  },
  {
    id: 'task-003',
    fmsName: 'Purchase Fms V.1',
    taskName: 'Entry In Tally',
    assignedTo: 'emp-001',
    dueDate: '2025-05-01',
    status: 'pending',
    priority: 'medium',
    department: 'Purchase'
  },
  {
    id: 'task-004',
    fmsName: 'Payment Fms',
    taskName: 'Tally Entry',
    assignedTo: 'emp-001',
    dueDate: '2025-05-01',
    status: 'pending',
    priority: 'high',
    department: 'Finance'
  },
  {
    id: 'task-005',
    fmsName: 'OTD V 2-HTML',
    taskName: 'Audit',
    assignedTo: 'emp-001',
    dueDate: '2025-05-01',
    status: 'completed',
    priority: 'medium',
    department: 'Quality'
  },
  {
    id: 'task-006',
    fmsName: 'Generate Ticket Fms',
    taskName: 'Problem Solve -Afroj Begam',
    assignedTo: 'emp-001',
    dueDate: '2025-05-01',
    status: 'pending',
    priority: 'high',
    department: 'Support'
  }
];

// Helper Functions
const getEmployeeById = (id) => employees.find(emp => emp.id === id);
const getTasksByEmployeeId = (employeeId) => tasks.filter(task => task.assignedTo === employeeId);

// StatsCard Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-2 sm:p-3 rounded-lg`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};

// DoughnutChart Component
const DoughnutChart = ({ data, labels, colors }) => {
  const total = data.reduce((sum, val) => sum + val, 0);
  
  return (
    <div className="space-y-4">
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((value, index) => {
            const percentage = (value / total) * 100;
            const prevPercentages = data.slice(0, index).reduce((sum, val) => sum + (val / total) * 100, 0);
            const circumference = 2 * Math.PI * 40;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((prevPercentages / 100) * circumference);
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={colors[index]}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {labels.map((label, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
              <span className="text-gray-700">{label}</span>
            </div>
            <span className="font-semibold text-gray-800">{data[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main UserDashboard Component
const UserDashboard = () => {
  const userId = 'emp-001';
  const employee = getEmployeeById(userId);
  const [showDetails, setShowDetails] = useState(false);
  
  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">User not found</p>
        </div>
      </div>
    );
  }
  
  const userTasks = getTasksByEmployeeId(userId);
  const completedTasks = userTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
  
  const taskCompletionData = [completedTasks, pendingTasks];
  const taskCompletionLabels = ['Completed', 'Pending'];
  const taskCompletionColors = ['#10b981', '#f59e0b'];
  
  const completionPercentage = Math.round((completedTasks / userTasks.length) * 100);

  // Commitment comparison data
  const commitmentData = {
    actual: completedTasks,
    committed: employee.weeklyCommitment || 0,
    percentage: Math.round((completedTasks / (employee.weeklyCommitment || 1)) * 100)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">{employee.name} - {employee.designation}</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            More Details
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard 
            title="Performance Score" 
            value={employee.score} 
            icon={Award} 
            color="green"
            trend={{ value: 3.2, label: "vs last week", positive: true }}
          />
          
          <StatsCard 
            title="Total Tasks" 
            value={userTasks.length} 
            icon={ClipboardList} 
            color="blue"
          />
          
          <StatsCard 
            title="Completed Tasks" 
            value={completedTasks} 
            icon={CheckSquare} 
            color="green"
            trend={{ value: 8.1, label: "vs last week", positive: true }}
          />
          
          <StatsCard 
            title="Pending Tasks" 
            value={pendingTasks} 
            icon={Clock} 
            color="amber"
            trend={{ value: 1.5, label: "vs last week", positive: false }}
          />
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Task Completion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Task Completion</h2>
            <DoughnutChart 
              data={taskCompletionData} 
              labels={taskCompletionLabels}
              colors={taskCompletionColors}
            />
          </div>
          
          {/* Commitment Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Weekly Commitment Progress</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Committed Tasks</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-800">{commitmentData.committed}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Completed Tasks</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-800">{commitmentData.actual}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                  <div 
                    className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
                      commitmentData.percentage >= 100 ? 'bg-green-500' :
                      commitmentData.percentage >= 75 ? 'bg-blue-500' :
                      commitmentData.percentage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(commitmentData.percentage, 100)}%` }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <span className={`text-xs sm:text-sm font-medium ${
                    commitmentData.percentage >= 100 ? 'text-green-600' :
                    commitmentData.percentage >= 75 ? 'text-blue-600' :
                    commitmentData.percentage >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {commitmentData.percentage}% of weekly commitment completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Details Table */}
        {showDetails && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Task Details</h2>
            </div>
            
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-gray-500">
                      Fms Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-gray-500">
                      Task Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-gray-500">
                      Target 🎯
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-gray-500">
                      Actual Achievement 🔥
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-gray-500">
                      % Work Not Done
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-gray-500">
                      % Work Not Done On Time
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                      All Pending Till Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userTasks.map((task, index) => {
                    const target = index === 0 ? 71 : Math.floor(Math.random() * 80) + 10;
                    const actual = task.status === 'completed' ? target : 
                                  index === 0 ? 59 : 
                                  Math.floor(Math.random() * target * 0.7);
                    const workNotDone = target > 0 ? ((target - actual) / target * 100).toFixed(8) : 0;
                    const workNotDoneOnTime = task.status === 'completed' ? 0 : 
                                             index === 0 ? 64.78873239 :
                                             parseFloat(workNotDone);
                    const pendingTillDate = task.status === 'pending' ? Math.floor(Math.random() * 50) : 
                                           task.status === 'in-progress' ? (index === 0 ? 12 : Math.floor(Math.random() * 30)) : 0;
                    
                    return (
                      <tr key={task.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 whitespace-nowrap">
                          {task.fmsName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200">
                          {task.taskName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-center border-r border-gray-200 font-semibold">
                          {target}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-center border-r border-gray-200 font-semibold">
                          {actual}
                        </td>
                        <td className="px-4 py-3 text-sm text-center border-r border-gray-200">
                          <span className={`font-semibold ${parseFloat(workNotDone) > 50 ? 'text-red-600' : parseFloat(workNotDone) > 20 ? 'text-amber-600' : 'text-green-600'}`}>
                            {parseFloat(workNotDone) > 0 ? `-${workNotDone}` : workNotDone}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center border-r border-gray-200">
                          <span className={`font-semibold ${workNotDoneOnTime > 50 ? 'text-red-600' : workNotDoneOnTime > 20 ? 'text-amber-600' : 'text-green-600'}`}>
                            {workNotDoneOnTime > 0 ? `-${workNotDoneOnTime.toFixed(8)}` : workNotDoneOnTime}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-center font-semibold">
                          {pendingTillDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {userTasks.map((task, index) => {
                const target = index === 0 ? 71 : Math.floor(Math.random() * 80) + 10;
                const actual = task.status === 'completed' ? target : 
                              index === 0 ? 59 : 
                              Math.floor(Math.random() * target * 0.7);
                const workNotDone = target > 0 ? ((target - actual) / target * 100).toFixed(8) : 0;
                const workNotDoneOnTime = task.status === 'completed' ? 0 : 
                                         index === 0 ? 64.78873239 :
                                         parseFloat(workNotDone);
                const pendingTillDate = task.status === 'pending' ? Math.floor(Math.random() * 50) : 
                                       task.status === 'in-progress' ? (index === 0 ? 12 : Math.floor(Math.random() * 30)) : 0;
                
                return (
                  <div key={task.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start pb-2 border-b border-gray-200">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">FMS Name</p>
                          <p className="text-sm font-medium text-gray-800">{task.fmsName}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Task Name</p>
                        <p className="text-sm text-gray-800">{task.taskName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Target 🎯</p>
                          <p className="text-lg font-bold text-blue-900">{target}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <p className="text-xs font-semibold text-orange-700 mb-1">Actual 🔥</p>
                          <p className="text-lg font-bold text-orange-900">{actual}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">% Not Done</p>
                          <p className={`text-sm font-bold ${parseFloat(workNotDone) > 50 ? 'text-red-600' : parseFloat(workNotDone) > 20 ? 'text-amber-600' : 'text-green-600'}`}>
                            {parseFloat(workNotDone) > 0 ? `-${workNotDone}` : workNotDone}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">% Not On Time</p>
                          <p className={`text-sm font-bold ${workNotDoneOnTime > 50 ? 'text-red-600' : workNotDoneOnTime > 20 ? 'text-amber-600' : 'text-green-600'}`}>
                            {workNotDoneOnTime > 0 ? `-${workNotDoneOnTime.toFixed(2)}` : workNotDoneOnTime}
                          </p>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <p className="text-xs font-semibold text-purple-700 mb-1">Pending Till Date</p>
                        <p className="text-lg font-bold text-purple-900">{pendingTillDate}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Recent Performance Feedback</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2.5 bg-green-50 rounded-r">
              <p className="text-xs sm:text-sm text-gray-800">
                Great job completing the UI Design task ahead of schedule! Your attention to detail and creativity were exceptional.
              </p>
              <p className="text-xs text-gray-600 mt-1.5 font-medium">Manager Feedback - 3 days ago</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2.5 bg-blue-50 rounded-r">
              <p className="text-xs sm:text-sm text-gray-800">
                Your collaboration with the design team has been excellent. Continue to maintain this level of communication.
              </p>
              <p className="text-xs text-gray-600 mt-1.5 font-medium">Team Lead Feedback - 1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;