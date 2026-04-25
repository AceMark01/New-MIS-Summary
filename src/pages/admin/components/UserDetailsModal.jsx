import React from "react";
import ReactDOM from "react-dom";
import { X, Loader2, Filter, Calendar, ChevronDown } from "lucide-react";

const UserDetailsModal = ({
    selectedUserDetails,
    setSelectedUserDetails,
    activeDrillDown,
    setActiveDrillDown,
    handleDrillDown,
}) => {
    const [timeFilter, setTimeFilter] = React.useState("all");
    const [statusFilter, setStatusFilter] = React.useState("all");

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        // Expected format: dd/mm/yyyy hh:mm:ss
        const parts = dateStr.split(" ");
        const dateParts = parts[0].split("/");
        if (dateParts.length !== 3) return null;
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);

        if (parts.length > 1) {
            const timeParts = parts[1].split(":");
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = parseInt(timeParts[2], 10) || 0;
            return new Date(year, month, day, hours, minutes, seconds);
        }
        return new Date(year, month, day);
    };

    const isOnTimeRow = (row) => {
        const delay = String(row.delay || "").trim();
        const actual = String(row.actual || "").trim();
        // On Time: actual is filled AND delay is zero, empty, or 00:00:00
        return actual !== "" && (delay === "00:00:00" || delay === "0" || delay === "00:00" || delay === "");
    };

    const isPendingRow = (row) => {
        const actual = String(row.actual || "").trim();
        return actual === "";
    };

    const isDelayRow = (row) => {
        const delay = String(row.delay || "").trim();
        const actual = String(row.actual || "").trim();
        // Delay: has a real delay value (not empty, not zero) AND is NOT pending (actual is NOT blank)
        return actual !== "" && delay !== "" && delay !== "00:00:00" && delay !== "0";
    };

    const getRowBg = (row) => {
        // Pending (actual blank) takes highest priority — even if delay exists
        if (isPendingRow(row)) return "bg-rose-100 hover:bg-rose-200";
        if (isDelayRow(row)) return "bg-orange-100 hover:bg-orange-200";
        if (isOnTimeRow(row)) return "bg-green-100 hover:bg-green-200";
        return "hover:bg-gray-50";
    };

    const filteredRows = React.useMemo(() => {
        if (!activeDrillDown || !activeDrillDown.rows) return [];

        let rows = activeDrillDown.rows;

        // Status filter
        if (statusFilter === "ontime") rows = rows.filter(isOnTimeRow);
        else if (statusFilter === "pending") rows = rows.filter(isPendingRow);
        else if (statusFilter === "delay") rows = rows.filter(isDelayRow);

        // Time filter
        if (timeFilter === "all") return rows;

        const now = new Date();
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return rows.filter(row => {
            const rowDate = parseDate(row.actual) || parseDate(row.planned);
            if (!rowDate) return false;

            if (timeFilter === "today") {
                return rowDate >= todayAtMidnight;
            } else if (timeFilter === "week") {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return rowDate >= weekAgo;
            } else if (timeFilter === "month") {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return rowDate >= monthAgo;
            }
            return true;
        });
    }, [activeDrillDown, timeFilter, statusFilter]);

    return (
        <>
            {/* User Details Modal - Rendered via Portal to cover header/sidebar */}
            {selectedUserDetails && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-2 md:p-4">
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
                                {/* Tasks Details Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Task Details
                                    </h3>

                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">FMS Name</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Task Name</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Department</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Target</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Total Achievement</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">% Work Not Done</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">% Work Not Done on Time</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">All Pending Till Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedUserDetails.tasks && selectedUserDetails.tasks.length > 0 ? (
                                                    selectedUserDetails.tasks.map((task, idx) => (
                                                        <tr
                                                            key={idx}
                                                            onClick={(e) => handleDrillDown(task, "Total Achievement", task.totalAchievement, e)}
                                                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                        >
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.fmsName}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.taskName}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.department}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 font-medium">{task.target}</td>
                                                            <td className="px-3 py-2 text-xs font-medium">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${parseFloat(task.totalAchievement) < parseFloat(task.target) ? "bg-red-100 text-red-800" : parseFloat(task.totalAchievement) === parseFloat(task.target) ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                                                    {task.totalAchievement}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.workNotDone}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.workNotDoneOnTime}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.allPendingTillDate}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="8" className="px-3 py-2 text-center text-xs text-gray-500">No tasks available</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-3">
                                        {selectedUserDetails.tasks && selectedUserDetails.tasks.length > 0 ? (
                                            selectedUserDetails.tasks.map((task, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => handleDrillDown(task, "Total Achievement", task.totalAchievement, e)}
                                                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm active:bg-blue-50 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate mb-0.5">{task.fmsName}</p>
                                                            <h4 className="text-sm font-bold text-gray-900 truncate">{task.taskName}</h4>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${parseFloat(task.totalAchievement) < parseFloat(task.target) ? "bg-red-100 text-red-800" : parseFloat(task.totalAchievement) === parseFloat(task.target) ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                                            {task.totalAchievement} / {task.target}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gray-50 pt-2">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Dept</p>
                                                            <p className="text-xs text-gray-700 font-semibold truncate">{task.department}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">All Pending</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{task.allPendingTillDate}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">% Not Done</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{task.workNotDone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">% Late</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{task.workNotDoneOnTime}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <p className="text-xs text-gray-500">No tasks available</p>
                                            </div>
                                        )}
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
                , document.body)}

            {/* Drill Down Modal - Rendered via Portal above User Details Modal */}
            {activeDrillDown && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fadeIn border-2 border-gray-100">
                        <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-wrap">
                            {/* Title */}
                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-gray-900 leading-tight">
                                    {activeDrillDown.title}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                    {activeDrillDown.taskId} • <span className="font-bold text-blue-600">Total Tasks: {filteredRows.length}</span>
                                </p>
                            </div>
                            {/* Filters + Close */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {!activeDrillDown.loading && !activeDrillDown.error && (
                                    <>
                                        {/* Status Buttons */}
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setStatusFilter("all")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "all" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>All</button>
                                            <button onClick={() => setStatusFilter("ontime")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "ontime" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>On Time</button>
                                            <button onClick={() => setStatusFilter("pending")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "pending" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}>Pending</button>
                                            <button onClick={() => setStatusFilter("delay")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "delay" ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"}`}>Delay</button>
                                        </div>
                                    </>
                                )}
                                {/* Close Button */}
                                <button onClick={() => setActiveDrillDown(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-1">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {activeDrillDown.loading ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-sm text-gray-500">Loading data...</p>
                                </div>
                            ) : activeDrillDown.error ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <p className="text-sm text-red-500">Error: {activeDrillDown.error}</p>
                                </div>
                            ) : (
                                <div className="p-4">
                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Planned</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delay</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredRows && filteredRows.length > 0 ? (
                                                    filteredRows.map((row, idx) => (
                                                        <tr key={idx} className={`${getRowBg(row)} transition-colors`}>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{row.taskName}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{row.planned}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">{row.actual || '-'}</td>
                                                            <td className={`px-4 py-3 text-sm font-medium ${isDelayRow(row) ? 'text-orange-600' : 'text-gray-700'}`}>{row.delay || '00:00:00'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-gray-500">No data available</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-3">
                                        {filteredRows && filteredRows.length > 0 ? (
                                            filteredRows.map((row, idx) => (
                                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2">{row.taskName}</h4>
                                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gray-50 pt-2">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Planned</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{row.planned}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Actual</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{row.actual}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Delay</p>
                                                            <p className={`text-xs font-semibold ${row.delay && String(row.delay).toLowerCase().includes('late') ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                {row.delay || 'On Time'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <p className="text-xs text-gray-500">No data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                , document.body)}
        </>
    );
};

export default UserDetailsModal;
