// ============ DASHBOARD PAGE ============
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LayoutDashboard, Users, Calendar, Clock, AlertTriangle, Search, ChevronDown, Download, Filter, MessageSquare, Briefcase, TrendingUp, X, MapPin, Phone, Mail, User, Info } from 'lucide-react';
import { getDisplayableImageUrl } from '../../utils/imageUtils';
import {
  employees,
  getTopScorers,
  getLowestScorers,
  getEmployeesByPendingTasks,
  departments,
  getWeeklyCommitmentComparison,
} from "../../data/mockData";
import EmployeesTable from "../../components/tables/EmployeesTable";
import HalfCircleChart from "../../components/charts/HalfCircleChart";
import HorizontalBarChart from "../../components/charts/HorizontalBarChart";
import VerticalBarChart from "../../components/charts/VerticalBarChart";
import { generateDashboardPDF } from "../../utils/pdfGenerator";

const getCurrentWeek = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay() || 7; // Make Sunday 7
  startOfWeek.setDate(today.getDate() - day + 1); // Set to Monday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 5);

  return {
    start: startOfWeek.toISOString().split("T")[0],
    end: endOfWeek.toISOString().split("T")[0],
  };
};


const DateAssignmentToolbar = ({
  assignmentType,
  handleTypeChange,
  assignmentStartDate,
  handleStartDateChange,
  assignmentEndDate,
  handleEndDateChange
}) => (
  <div className="hidden md:flex items-end gap-3 mr-3 pb-0.5">
    {!assignmentType && (
      <span className="text-sm text-red-500 font-medium animate-pulse mb-2.5">
        Select type
      </span>
    )}

    <div>
      <select
        value={assignmentType}
        onChange={handleTypeChange}
        className="block h-[38px] pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
      >
        <option value="" disabled>Type</option>
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 leading-none ml-1">Start Date</label>
      <input
        type="date"
        value={assignmentStartDate}
        onChange={handleStartDateChange}
        className="block h-[38px] w-36 px-3 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 leading-none ml-1">End Date</label>
      <input
        type="date"
        value={assignmentEndDate}
        onChange={handleEndDateChange}
        className="block h-[38px] w-36 px-3 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
      />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  // Dashboard Logic
  const [dateRange, setDateRange] = useState(getCurrentWeek());

  // New State for Sheet Data
  const [loading, setLoading] = useState(true);
  const [sheetEmployees, setSheetEmployees] = useState([]);

  // Dynamic Column Labels
  const [columnLabels, setColumnLabels] = useState({
    name: "Name",
    designation: "Designation",
    target: "Target",
    actualWork: "Actual Work",
    weeklyDone: "Weekly Done %",
    weeklyOnTime: "Weekly On Time %",
    totalWork: "Total Work",
    weekPending: "Week Pending",
    allPending: "All Pending"
  });

  // Column Visibility State
  const ALL_COLUMNS = [

    { key: "name", label: columnLabels.name },
    { key: "designation", label: columnLabels.designation },
    { key: "target", label: columnLabels.target },
    { key: "actualWork", label: columnLabels.actualWork },
    { key: "weeklyDone", label: columnLabels.weeklyDone },
    { key: "weeklyOnTime", label: columnLabels.weeklyOnTime },
    { key: "totalWork", label: columnLabels.totalWork },
    { key: "weekPending", label: columnLabels.weekPending },
    { key: "allPending", label: columnLabels.allPending },
    { key: "lastWeekPlannedNotDone", label: "Last Week Planned Work Not Done %" },
    { key: "lastWeekPlannedNotDoneOnTime", label: "Last Week Planned Work Not Done On Time %" },
    { key: "lastWeekCommitment", label: "Last Week Commitment" },
    { key: "nextWeekPlannedNotDone", label: columnLabels.nextWeekPlannedNotDone },
    { key: "nextWeekPlannedNotDoneOnTime", label: columnLabels.nextWeekPlannedNotDoneOnTime },
    { key: "nextWeekCommitment", label: columnLabels.nextWeekCommitment },
  ];

  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const initial = {};
    ALL_COLUMNS.forEach(col => initial[col.key] = true);
    return initial;
  });

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAllColumns = (e) => {
    const isChecked = e.target.checked;
    const newVisibility = {};
    ALL_COLUMNS.forEach(col => newVisibility[col.key] = isChecked);
    setVisibleColumns(newVisibility);
  };
  const [selectAll, setSelectAll] = useState(false);
  const [employeeCommitments, setEmployeeCommitments] = useState({});
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterHR, setFilterHR] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [activeDrillDown, setActiveDrillDown] = useState(null);

  // Date Assignment State
  const [assignmentType, setAssignmentType] = useState("");
  const [assignmentStartDate, setAssignmentStartDate] = useState("");
  const [assignmentEndDate, setAssignmentEndDate] = useState("");

  const handleTypeChange = useCallback((e) => {
    const type = e.target.value;
    setAssignmentType(type);

    // Recalculate end date if start date exists
    if (assignmentStartDate) {
      const start = new Date(assignmentStartDate);
      if (type === "Weekly") {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setAssignmentEndDate(end.toISOString().split('T')[0]);
      } else if (type === "Monthly") {
        const end = new Date(start);
        end.setDate(start.getDate() + 30);
        setAssignmentEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [assignmentStartDate]);

  const handleStartDateChange = useCallback((e) => {
    const date = e.target.value;
    setAssignmentStartDate(date);

    if (date && assignmentType) {
      const start = new Date(date);
      if (assignmentType === "Weekly") {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setAssignmentEndDate(end.toISOString().split('T')[0]);
      } else if (assignmentType === "Monthly") {
        const end = new Date(start);
        end.setDate(start.getDate() + 30);
        setAssignmentEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [assignmentType]);

  const handleEndDateChange = useCallback((e) => {
    setAssignmentEndDate(e.target.value);
  }, []);

  // Reset assignment state when no employees selected
  useEffect(() => {
    if (selectedEmployees.length === 0) {
      setAssignmentType("");
      setAssignmentStartDate("");
      setAssignmentEndDate("");
    }
  }, [selectedEmployees]);

  // New State for Data Editing
  const [editableData, setEditableData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [archivedMap, setArchivedMap] = useState({});

  // Handle Edit functionalities
  const handleInputChange = (employeeId, field, value) => {
    // Number validation
    if (value && !/^\d*$/.test(value)) return;

    setEditableData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (employeeId) => {
    const alreadySelected = selectedEmployees.includes(employeeId);
    const emp = sheetEmployees.find(e => e.id === employeeId);
    if (!emp) return;

    // 🔹 SELECT
    if (!alreadySelected) {
      const existing = archivedMap[emp.name];

      // ⭐ AUTO-POPULATE DATES + VALUES
      if (existing) {
        setAssignmentStartDate(existing.start);
        setAssignmentEndDate(existing.end);

        setEditableData(prev => ({
          ...prev,
          [employeeId]: existing.values
        }));
      } else {
        setEditableData(prev => ({
          ...prev,
          [employeeId]: {
            nextWeekPlannedNotDone: "",
            nextWeekPlannedNotDoneOnTime: "",
            nextWeekCommitment: ""
          }
        }));
      }
    }
    // 🔹 UNSELECT
    else {
      setEditableData(prev => {
        const copy = { ...prev };
        delete copy[employeeId];
        return copy;
      });
    }

    handleEmployeeSelect(employeeId);
  };

  // Fetch Data from Google Sheet
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
        if (!scriptUrl) {
          console.error("VITE_APPS_SCRIPT_URL not set");
          // Fallback to mock data if URL missing
          setSheetEmployees(employees);
          setLoading(false);
          return;
        }

        // Fetch sheets
        const [recordsResponse, archivedResponse, masterResponse] = await Promise.all([
          fetch(`${scriptUrl}?sheet=For Records`),
          fetch(`${scriptUrl}?sheet=Archived`),
          fetch(`${scriptUrl}?sheet=Master`)
        ]);

        const result = await recordsResponse.json();
        const archivedResult = await archivedResponse.json();
        const masterResult = await masterResponse.json();

        // Build image map from Master sheet (Column A: Name, Column E: Image)
        const imageMap = {};
        if (masterResult.success && Array.isArray(masterResult.data)) {
          masterResult.data.slice(1).forEach(row => {
            const name = row[0] ? String(row[0]).trim().toLowerCase() : "";
            const imageUrl = row[4];
            if (name && imageUrl) {
              imageMap[name] = imageUrl;
            }
          });
        }

        // Update Dynamic Headers from Archived Sheet
        // Expected: D, E, F -> Indices 3, 4, 5
        if (archivedResult.success && archivedResult.data && archivedResult.data[0]) {
          const arcHeaders = archivedResult.data[0];
          setColumnLabels(prev => ({
            ...prev,
            nextWeekPlannedNotDone: arcHeaders[3] || prev.nextWeekPlannedNotDone || "Next Week Planned Work Not Done",
            nextWeekPlannedNotDoneOnTime: arcHeaders[4] || prev.nextWeekPlannedNotDoneOnTime || "Next Week Planned Work Not Done On Time",
            nextWeekCommitment: arcHeaders[5] || prev.nextWeekCommitment || "Next Week Commitment"
          }));
        }

        // Process Archived Data to find latest entry per employee
        // 🔹 Build archived map by NAME (latest entry wins)
        const newArchivedMap = {};

        // Calculate current week range to filter data
        const currentWeek = getCurrentWeek();

        if (archivedResult.data && Array.isArray(archivedResult.data)) {
          archivedResult.data.slice(1).forEach((row, idx) => {
            const name = row[0];
            const rowStart = row[1];
            const rowEnd = row[2];

            if (!name) return;

            // 🔹 FILTER: Only fetch data for the CURRENT WEEK
            // Normalize dates to YYYY-MM-DD for comparison
            const normalizeDate = (d) => {
              if (!d) return "";
              const dateObj = new Date(d);
              if (isNaN(dateObj)) return d; // Return original if parsing fails
              return dateObj.toISOString().split("T")[0];
            };

            const normRowStart = normalizeDate(rowStart);

            // Allow any entry that STARTS within the current week range
            // This handles cases where assignment starts mid-week (e.g. Tuesday)
            if (normRowStart < currentWeek.start || normRowStart > currentWeek.end) {
              return;
            }

            newArchivedMap[name] = {
              rowIndex: idx + 2,
              start: normRowStart,
              end: normalizeDate(rowEnd),
              values: {
                nextWeekPlannedNotDone: row[3]?.toString() || "",
                nextWeekPlannedNotDoneOnTime: row[4]?.toString() || "",
                nextWeekCommitment: row[5]?.toString() || ""
              }
            };
          });
        }

        setArchivedMap(newArchivedMap);

        if (result.success && Array.isArray(result.data)) {
          // Parse Sheet Data
          const headers = result.data[0];

          // Update column labels from sheet headers if available
          if (headers) {
            setColumnLabels(prev => ({
              ...prev,
              name: headers[2] || prev.name,
              designation: headers[3] || prev.designation,
              target: headers[4] || prev.target,
              actualWork: headers[5] || prev.actualWork,
              weeklyDone: headers[6] || prev.weeklyDone,
              weeklyOnTime: headers[7] || prev.weeklyOnTime,
              totalWork: headers[8] || prev.totalWork,
              weekPending: headers[9] || prev.weekPending,
              allPending: headers[10] || prev.allPending
            }));
          }

          // Sheet Headers: Date Start: 1, Date End: 2, Name: 3, Designation: 4, Target: 5, Actual Work Done: 6, % Work Not Done: 7, % Work Not Done On Time: 8, Total Work Done: 9, Week Pending: 10, All Pending: 11

          const parsedData = result.data.slice(1)
            .filter(row => row[2] && String(row[2]).trim() !== "") // Filter out rows where Name is empty
            .map((row, index) => { // Slice 1 to skip header
              const randomId = `emp-${100 + index}`;
              const empName = row[2] || "Unknown";
              const normalizedName = String(empName).trim().toLowerCase();
              // Use newArchivedMap here which contains the actual data
              const archivedData = newArchivedMap[empName] ? newArchivedMap[empName].values : {};

              const rawImageUrl = imageMap[normalizedName];
              let finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=0D8ABC&color=fff&size=128`;

              if (rawImageUrl) {
                const processedUrl = getDisplayableImageUrl(rawImageUrl);
                if (processedUrl) finalImageUrl = processedUrl;
              }

              return {
                id: randomId,
                name: empName,
                designation: row[3] || "",
                department: "", // Dummy Department Removed
                image: finalImageUrl,

                // Mapped Fields
                target: row[4] || 0,
                actualWorkDone: row[5] || 0,
                weeklyWorkDone: row[6] || "0%", // Showing negative % directly
                weeklyWorkDoneOnTime: row[7] || "0%",
                totalWorkDone: row[8] || 0,
                weekPending: row[9] || 0,
                allPendingTillDate: row[10] || 0,

                // Removed Dummy Data for missing columns
                plannedWorkNotDone: 0,
                plannedWorkNotDoneOnTime: 0,
                commitment: 0,

                nextWeekPlannedWorkNotDone: archivedData.nextWeekPlannedNotDone || 0,
                nextWeekPlannedWorkNotDoneOnTime: archivedData.nextWeekPlannedNotDoneOnTime || 0,
                nextWeekCommitment: archivedData.nextWeekCommitment || 0
              };
            });

          setSheetEmployees(parsedData);
        } else {
          console.error("Failed to load sheet data", result);
          setSheetEmployees(employees); // Fallback
        }
      } catch (error) {
        console.error("Error fetching sheet data:", error);
        setSheetEmployees(employees); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only fetch on mount

  useEffect(() => {
    const saved = localStorage.getItem("employeeCommitments");
    if (saved) {
      setEmployeeCommitments(JSON.parse(saved));
    }
  }, []);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return sheetEmployees.filter((emp) => {
      const matchesName = emp.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const matchesDepartment =
        filterDepartment === "" || emp.department === filterDepartment;
      const matchesHR = filterHR === "" || emp.hrName === filterHR;
      return matchesName && matchesDepartment && matchesHR;
    });
  }, [sheetEmployees, filterName, filterDepartment, filterHR]);

  // Get unique departments and HR names
  const uniqueDepartments = useMemo(() => [
    ...new Set(sheetEmployees.map((emp) => emp.department)),
  ], [sheetEmployees]);

  const uniqueHRNames = useMemo(() => [
    ...new Set(sheetEmployees.map((emp) => emp.hrName).filter(Boolean)),
  ], [sheetEmployees]);

  // Statistics - Memoized
  const {
    topScorers,
    lowestScorers,
    employeesByPending,
    commitmentComparison
  } = useMemo(() => ({
    topScorers: getTopScorers(5),
    lowestScorers: getLowestScorers(5),
    employeesByPending: getEmployeesByPendingTasks(),
    commitmentComparison: getWeeklyCommitmentComparison()
  }), []); // Using empty deps as utils use internal mock data

  const topScorersData = useMemo(() => topScorers.map((emp) => emp.score), [topScorers]);
  const topScorersLabels = useMemo(() => topScorers.map((emp) => emp.name), [topScorers]);
  const lowestScorersData = useMemo(() => lowestScorers.map((emp) => emp.score), [lowestScorers]);
  const lowestScorersLabels = useMemo(() => lowestScorers.map((emp) => emp.name), [lowestScorers]);
  const pendingTasksData = useMemo(() => employeesByPending.map((emp) => emp.pendingTasks), [employeesByPending]);
  const pendingTasksLabels = useMemo(() => employeesByPending.map((emp) => emp.name), [employeesByPending]);
  const departmentScoresData = useMemo(() => departments.map((dept) => dept.averageScore), []);
  const departmentScoresLabels = useMemo(() => departments.map((dept) => dept.name), []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    }
    setSelectAll(!selectAll);
  };



  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleCommitmentChange = (employeeId, field, value) => {
    // Allow empty string to clear the field (showing placeholder)
    if (value === "") {
      setEmployeeCommitments((prev) => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [field]: "",
        },
      }));
      return;
    }

    // Only set if valid number
    const num = parseInt(value);
    if (!isNaN(num)) {
      setEmployeeCommitments((prev) => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [field]: num,
        },
      }));
    }
  };

  const handleRowClick = (employee) => {
    // Add demo task data for the selected user
    const employeeWithDemoTasks = {
      ...employee,
      tasks: [
        {
          fmsName: "Project Alpha",
          taskName: "Design System Implementation",
          target: 100,
          actualAchievement: 85,
          workNotDone: 15,
          workNotDoneOnTime: 8,
          allPendingTillDate: 3,
        },
        {
          fmsName: "Project Beta",
          taskName: "API Integration",
          target: 100,
          actualAchievement: 92,
          workNotDone: 8,
          workNotDoneOnTime: 5,
          allPendingTillDate: 1,
        },
        {
          fmsName: "Project Gamma",
          taskName: "User Testing",
          target: 100,
          actualAchievement: 78,
          workNotDone: 22,
          workNotDoneOnTime: 12,
          allPendingTillDate: 5,
        },
        {
          fmsName: "Project Delta",
          taskName: "Documentation",
          target: 100,
          actualAchievement: 95,
          workNotDone: 5,
          workNotDoneOnTime: 2,
          allPendingTillDate: 0,
        },
        {
          fmsName: "Project Epsilon",
          taskName: "Performance Optimization",
          target: 100,
          actualAchievement: 88,
          workNotDone: 12,
          workNotDoneOnTime: 7,
          allPendingTillDate: 2,
        },
      ],
    };
    setSelectedUserDetails(employeeWithDemoTasks);
  };

  const handleDrillDown = (task, type, value, event) => {
    event.stopPropagation();
    if (value === 0) return;

    // Generate dummy data based on count
    const rows = Array.from({ length: value }, (_, i) => {
      const planned = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      const actual = new Date(planned.getTime() + Math.floor(Math.random() * 172800000)); // +0-48 hours

      return {
        id: `TD-${Math.floor(Math.random() * 10000)}`,
        description: `${type} item for ${task.taskName} - ${i + 1}`,
        plannedDate: planned.toLocaleDateString(),
        actualDate: actual.toLocaleDateString(),
        delayHours: Math.floor(Math.random() * 48)
      };
    });

    setActiveDrillDown({
      taskId: task.taskName, // using taskName as ID since there's no unique ID in demo data
      type,
      count: value,
      rows,
      title: `${type} Details (${value})`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) return;

    if (!assignmentType || !assignmentStartDate || !assignmentEndDate) {
      alert("Please select Type, Start Date, and End Date.");
      return;
    }

    setSubmitting(true);

    try {
      const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;

      for (const id of selectedEmployees) {
        const emp = sheetEmployees.find(e => e.id === id);
        const inputs = editableData[id] || {};

        const row = [
          emp.name,
          assignmentStartDate,
          assignmentEndDate,
          inputs.nextWeekPlannedNotDone || "",
          inputs.nextWeekPlannedNotDoneOnTime || "",
          inputs.nextWeekCommitment || ""
        ];

        // 🔹 LOOKUP: Use Name as key, matching how archivedMap is built
        const existing = archivedMap[emp.name];

        const payload = existing
          ? {
            action: "update",
            sheetName: "Archived",
            rowIndex: existing.rowIndex,
            rowData: JSON.stringify(row)
          }
          : {
            action: "insert",
            sheetName: "Archived",
            rowData: JSON.stringify(row)
          };

        const response = await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(payload)
        });

        const result = await response.json();

        // stop immediately on failure
        if (!result.success) {
          throw new Error(result.error || "Failed to save row");
        }
      }

      alert("Saved successfully ✅");

      setSelectedEmployees([]);
      setEditableData({});
      setSelectAll(false);

    } catch (error) {
      console.error(error);
      alert(`Stopped: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getNextWeekDateRange = () => {
    const today = new Date();
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(
      nextWeekStart.getDate() + (8 - nextWeekStart.getDay())
    );
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

    return {
      start: nextWeekStart.toISOString().split("T")[0],
      end: nextWeekEnd.toISOString().split("T")[0],
    };
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <button
          onClick={() => {
            const visibleColsList = ALL_COLUMNS.filter(col => visibleColumns[col.key]);

            // Merge employee commitments into filtered employee data for the PDF
            const pdfData = filteredEmployees.map(emp => ({
              ...emp,
              nextWeekPlannedWorkNotDone: employeeCommitments[emp.id]?.nextWeekPlannedWorkNotDone || emp.nextWeekPlannedWorkNotDone,
              nextWeekPlannedWorkNotDoneOnTime: employeeCommitments[emp.id]?.nextWeekPlannedWorkNotDoneOnTime || emp.nextWeekPlannedWorkNotDoneOnTime,
              nextWeekCommitment: employeeCommitments[emp.id]?.commitment || emp.nextWeekCommitment
            }));

            generateDashboardPDF(visibleColsList, pdfData);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </button>
      </div>

      {/* List of People Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              List of People
            </h2>
            <div className="flex gap-2 w-full sm:w-auto relative items-end">

              {/* Conditional Date Assignment Toolbar */}
              {/* Conditional Date Assignment Toolbar */}
              {selectedEmployees.length > 0 && (
                <DateAssignmentToolbar
                  assignmentType={assignmentType}
                  handleTypeChange={handleTypeChange}
                  assignmentStartDate={assignmentStartDate}
                  handleStartDateChange={handleStartDateChange}
                  assignmentEndDate={assignmentEndDate}
                  handleEndDateChange={handleEndDateChange}
                />
              )}

              <div className="relative">
                <button
                  onClick={() => setShowColumnFilter(!showColumnFilter)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Columns
                </button>
                {showColumnFilter && (
                  <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                      <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Object.values(visibleColumns).every(Boolean)}
                          onChange={toggleAllColumns}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 font-semibold">Select All</span>
                      </label>
                    </div>
                    <div className="p-2 space-y-1">
                      {ALL_COLUMNS.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => toggleColumn(col.key)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {col.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={selectedEmployees.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Submit ({selectedEmployees.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Name
              </label>
              <input
                type="text"
                placeholder="Search employee name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by HR Name
              </label>
              <select
                value={filterHR}
                onChange={(e) => setFilterHR(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All HR Names</option>
                {uniqueHRNames.map((hr) => (
                  <option key={hr} value={hr}>
                    {hr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-y-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>

                {visibleColumns.name && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.name}
                  </th>
                )}
                {visibleColumns.designation && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.designation}
                  </th>
                )}
                {visibleColumns.target && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.target}
                  </th>
                )}
                {visibleColumns.actualWork && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.actualWork}
                  </th>
                )}
                {visibleColumns.weeklyDone && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.weeklyDone}
                  </th>
                )}
                {visibleColumns.weeklyOnTime && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.weeklyOnTime}
                  </th>
                )}
                {visibleColumns.totalWork && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.totalWork}
                  </th>
                )}
                {visibleColumns.weekPending && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.weekPending}
                  </th>
                )}
                {visibleColumns.allPending && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {columnLabels.allPending}
                  </th>
                )}
                {visibleColumns.lastWeekPlannedNotDone && (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-red-100 text-red-700">
                    Last Week Planned Work Not Done %
                  </th>
                )}
                {visibleColumns.lastWeekPlannedNotDoneOnTime && (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-red-100 text-red-700">
                    Last Week Planned Work Not Done On Time %
                  </th>
                )}
                {visibleColumns.lastWeekCommitment && (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-red-100 text-red-700">
                    Last Week Commitment
                  </th>
                )}
                {visibleColumns.nextWeekPlannedNotDone && (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-green-100 text-green-700">
                    {columnLabels.nextWeekPlannedNotDone}
                  </th>
                )}
                {visibleColumns.nextWeekPlannedNotDoneOnTime && (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-green-100 text-green-700">
                    {columnLabels.nextWeekPlannedNotDoneOnTime}
                  </th>
                )}
                {visibleColumns.nextWeekCommitment && (
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-green-100 text-green-700">
                    {columnLabels.nextWeekCommitment}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  onClick={() => handleRowClick(employee)}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedEmployees.includes(employee.id) ? "bg-blue-50" : ""
                    }`}
                >
                  <td
                    className="w-12 px-3 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleCheckboxChange(employee.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>


                  {visibleColumns.name && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={employee.image}
                          alt={employee.name}
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>

                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.designation && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.designation}
                    </td>
                  )}
                  {visibleColumns.target && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {employee.target}
                    </td>
                  )}
                  {visibleColumns.actualWork && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {employee.actualWorkDone}
                    </td>
                  )}
                  {visibleColumns.weeklyDone && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {employee.weeklyWorkDone}
                    </td>
                  )}
                  {visibleColumns.weeklyOnTime && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {employee.weeklyWorkDoneOnTime}
                    </td>
                  )}
                  {visibleColumns.totalWork && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {employee.totalWorkDone}
                    </td>
                  )}
                  {visibleColumns.weekPending && (
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${employee.weekPending > 3
                          ? "bg-red-100 text-red-800"
                          : employee.weekPending > 1
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                          }`}
                      >
                        {employee.weekPending}
                      </span>
                    </td>
                  )}
                  {visibleColumns.allPending && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {employee.allPendingTillDate}
                    </td>
                  )}
                  {visibleColumns.lastWeekPlannedNotDone && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm bg-red-50 text-red-800 font-medium text-center">
                      {employee.plannedWorkNotDone}%
                    </td>
                  )}
                  {visibleColumns.lastWeekPlannedNotDoneOnTime && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm bg-red-50 text-red-800 font-medium text-center">
                      {employee.plannedWorkNotDoneOnTime}%
                    </td>
                  )}
                  {visibleColumns.lastWeekCommitment && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm bg-red-50 text-red-800 font-medium text-center">
                      {employee.commitment}%
                    </td>
                  )}
                  {visibleColumns.nextWeekPlannedNotDone && (
                    <td className="px-3 py-4 whitespace-nowrap bg-green-50 text-center">
                      {selectedEmployees.includes(employee.id) ? (
                        <input
                          type="text"
                          placeholder="0"
                          value={editableData[employee.id]?.nextWeekPlannedNotDone || ""}
                          onChange={(e) =>
                            handleInputChange(
                              employee.id,
                              "nextWeekPlannedNotDone",
                              e.target.value
                            )
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm text-green-800 font-medium">{employee.nextWeekPlannedWorkNotDone || 0}</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.nextWeekPlannedNotDoneOnTime && (
                    <td className="px-3 py-4 whitespace-nowrap bg-green-50 text-center">
                      {selectedEmployees.includes(employee.id) ? (
                        <input
                          type="text"
                          placeholder="0"
                          value={editableData[employee.id]?.nextWeekPlannedNotDoneOnTime || ""}
                          onChange={(e) =>
                            handleInputChange(
                              employee.id,
                              "nextWeekPlannedNotDoneOnTime",
                              e.target.value
                            )
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm text-green-800 font-medium">{employee.nextWeekPlannedWorkNotDoneOnTime || 0}</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.nextWeekCommitment && (
                    <td className="px-3 py-4 whitespace-nowrap bg-green-50 text-center">
                      {selectedEmployees.includes(employee.id) ? (
                        <input
                          type="text"
                          placeholder="0"
                          value={editableData[employee.id]?.nextWeekCommitment || ""}
                          onChange={(e) =>
                            handleInputChange(
                              employee.id,
                              "nextWeekCommitment",
                              e.target.value
                            )
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm text-green-800 font-medium">{employee.nextWeekCommitment || 0}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Fixed */}
        <div className="md:hidden">
          <div className="px-3 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-10">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({filteredEmployees.length})
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`border-b border-gray-200 ${selectedEmployees.includes(employee.id) ? "bg-blue-50" : ""
                  }`}
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeSelect(employee.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRowClick(employee)}
                      >
                        <img
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                          src={employee.image}
                          alt={employee.name}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {employee.name}
                          </div>

                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target:</span>
                          <span className="font-semibold">
                            {employee.target}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Actual:</span>
                          <span className="font-semibold">
                            {employee.actualWorkDone}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pending:</span>
                          <span
                            className={`font-semibold ${employee.weekPending > 3
                              ? "text-red-600"
                              : employee.weekPending > 1
                                ? "text-yellow-600"
                                : "text-green-600"
                              }`}
                          >
                            {employee.weekPending}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Commitment:</span>
                          <span className="font-semibold">
                            {employee.commitment}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedEmployee(
                          expandedEmployee === employee.id ? null : employee.id
                        )
                      }
                      className="p-2 hover:bg-gray-200 rounded flex-shrink-0"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expandedEmployee === employee.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedEmployee === employee.id && (
                    <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Weekly Done</p>
                          <p className="font-semibold text-gray-900">
                            {employee.weeklyWorkDone}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">On Time</p>
                          <p className="font-semibold text-gray-900">
                            {employee.weeklyWorkDoneOnTime}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Total Work</p>
                          <p className="font-semibold text-gray-900">
                            {employee.totalWorkDone}%
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">All Pending</p>
                          <p className="font-semibold text-gray-900">
                            {employee.allPendingTillDate}
                          </p>
                        </div>
                      </div>

                      {selectedEmployees.includes(employee.id) && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-3">
                          <p className="text-xs font-semibold text-blue-900">
                            Next Week Inputs
                          </p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">
                                Work Not Done %
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  employeeCommitments[employee.id]
                                    ?.nextWeekPlannedWorkNotDone || 0
                                }
                                onChange={(e) =>
                                  handleCommitmentChange(
                                    employee.id,
                                    "nextWeekPlannedWorkNotDone",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">
                                Work Not Done On Time %
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  employeeCommitments[employee.id]
                                    ?.nextWeekPlannedWorkNotDoneOnTime || 0
                                }
                                onChange={(e) =>
                                  handleCommitmentChange(
                                    employee.id,
                                    "nextWeekPlannedWorkNotDoneOnTime",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">
                                Commitment %
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  employeeCommitments[employee.id]
                                    ?.commitment || 0
                                }
                                onChange={(e) =>
                                  handleCommitmentChange(
                                    employee.id,
                                    "commitment",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Details Modal - Fixed for Mobile */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  src={selectedUserDetails.image}
                  alt={selectedUserDetails.name}
                />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">
                    {selectedUserDetails.name}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    {selectedUserDetails.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Tasks Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Task Details
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <div className="min-w-[600px]">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              FMS Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Task Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Planned
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Actual
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Delay
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Late
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Pending
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedUserDetails.tasks &&
                            selectedUserDetails.tasks.length > 0 ? (
                            selectedUserDetails.tasks.map((task, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                                  {task.fmsName}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                                  {task.taskName}
                                </td>
                                <td
                                  className={`px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors ${activeDrillDown?.taskId === task.taskName && activeDrillDown?.type === "Planned"
                                    ? "bg-blue-100 font-semibold"
                                    : ""
                                    }`}
                                  onClick={(e) => handleDrillDown(task, "Planned", task.target, e)}
                                >
                                  {task.target}
                                </td>
                                <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">
                                  <span
                                    onClick={(e) => handleDrillDown(task, "Actual", task.actualAchievement, e)}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${activeDrillDown?.taskId === task.taskName && activeDrillDown?.type === "Actual"
                                      ? "ring-2 ring-offset-1 ring-blue-500"
                                      : ""
                                      } ${task.actualAchievement < task.target
                                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                                        : task.actualAchievement === task.target
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      }`}
                                  >
                                    {task.actualAchievement}
                                  </span>
                                </td>
                                <td
                                  className={`px-3 py-2 text-xs text-gray-900 whitespace-nowrap cursor-pointer hover:bg-blue-50 transition-colors ${activeDrillDown?.taskId === task.taskName && activeDrillDown?.type === "Delay"
                                    ? "bg-blue-100 font-semibold"
                                    : ""
                                    }`}
                                  onClick={(e) => handleDrillDown(task, "Delay", task.workNotDone, e)}
                                >
                                  {task.workNotDone}%
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                                  {task.workNotDoneOnTime}%
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                                  {task.allPendingTillDate}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-3 py-2 text-center text-xs text-gray-500"
                              >
                                No tasks available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-3 py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill Down Modal */}
      {activeDrillDown && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fadeIn border-2 border-gray-100">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {activeDrillDown.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeDrillDown.taskId}
                </p>
              </div>
              <button
                onClick={() => setActiveDrillDown(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delay (Hrs)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeDrillDown.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">

                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{row.plannedDate}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{row.actualDate}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                        {row.delayHours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Charts Grid - Fixed for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {/* Top 5 Scorers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <h2 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
            Top 5 Scorers
          </h2>
          <div className="h-32 md:h-40 lg:h-48 overflow-hidden">
            <HalfCircleChart
              data={topScorersData}
              labels={topScorersLabels}
              colors={["#8DD9D5", "#6BBBEA", "#BEA1E8", "#FFB77D", "#FF99A8"]}
            />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <h2 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
            Pending Tasks by User
          </h2>
          <div className="h-32 md:h-40 lg:h-48">
            <HorizontalBarChart
              data={pendingTasksData}
              labels={pendingTasksLabels}
              colors={["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2"]}
              maxValue={Math.max(...pendingTasksData) + 1}
            />
          </div>
        </div>

        {/* Lowest Scores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <h2 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
            Lowest Scores
          </h2>
          <div className="h-32 md:h-40 lg:h-48 overflow-hidden">
            <VerticalBarChart
              data={lowestScorersData}
              labels={lowestScorersLabels}
              colors={["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"]}
              maxValue={100}
            />
          </div>
        </div>
      </div>

      {/* Department Scores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
        <h2 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
          Department Scores
        </h2>
        <div className="h-32 md:h-40 lg:h-48 overflow-hidden">
          <VerticalBarChart
            data={departmentScoresData}
            labels={departmentScoresLabels}
            colors={["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"]}
            maxValue={100}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
