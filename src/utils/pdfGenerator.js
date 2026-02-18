import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { employees, departments, getTopScorers, getLowestScorers, getEmployeesByPendingTasks } from '../data/mockData';

export const generateDashboardPDF = (visibleColumnsList, filteredEmployeesData) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better column fit
  const today = new Date().toLocaleDateString();

  // Add title
  doc.setFontSize(20);
  doc.text('MIS System - Dashboard Report', 148, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${today}`, 148, 22, { align: 'center' });
  
  // Add horizontal line
  doc.setLineWidth(0.5);
  doc.line(14, 25, 283, 25);
  
  // All employees table
  doc.setFontSize(14);
  doc.text('List of Employees', 14, 35);
  
  let finalY = 40;

  if (visibleColumnsList && filteredEmployeesData) {
    const headers = visibleColumnsList.map(col => col.label);
    const body = filteredEmployeesData.map(emp => {
      return visibleColumnsList.map(col => {
        switch (col.key) {
          case 'id': return emp.id;
          case 'name': return emp.name;
          case 'target': return `${emp.target}%`;
          case 'actualWork': return `${emp.actualWorkDone}%`;
          case 'weeklyDone': return `${emp.weeklyWorkDone}%`;
          case 'weeklyOnTime': return `${emp.weeklyWorkDoneOnTime}%`;
          case 'totalWork': return `${emp.totalWorkDone}%`;
          case 'weekPending': return emp.weekPending;
          case 'allPending': return emp.allPendingTillDate;
          case 'lastWeekPlannedNotDone': return `${emp.plannedWorkNotDone}%`;
          case 'lastWeekPlannedNotDoneOnTime': return `${emp.plannedWorkNotDoneOnTime}%`;
          case 'lastWeekCommitment': return `${emp.commitment}%`;
          case 'nextWeekPlannedNotDone': return emp.nextWeekPlannedWorkNotDone ? `${emp.nextWeekPlannedWorkNotDone}%` : '0%'; // Using mock defaults or passed data if available
          case 'nextWeekPlannedNotDoneOnTime': return emp.nextWeekPlannedWorkNotDoneOnTime ? `${emp.nextWeekPlannedWorkNotDoneOnTime}%` : '0%';
          case 'nextWeekCommitment': return emp.nextWeekCommitment ? `${emp.nextWeekCommitment}%` : '0%';
          default: return '';
        }
      });
    });

    doc.autoTable({
      startY: 40,
      head: [headers],
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8, cellPadding: 2 }
    });
    finalY = doc.lastAutoTable.finalY + 15;
  } else {
    // Fallback to original static table if no dynamic data passed
    const employeeData = employees.map((emp) => [
      emp.id,
      emp.name,
      emp.department,
      emp.score,
      `${emp.completedTasks}/${emp.totalTasks}`,
      emp.pendingTasks
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['ID', 'Name', 'Department', 'Score', 'Completed/Total Tasks', 'Pending Tasks']],
      body: employeeData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });
    finalY = doc.lastAutoTable.finalY + 15;
  }
  
  // Top 5 Scorers
  const topScorers = getTopScorers(5);
  // Check if we need a new page - threshold increased to ensure header + table fit
  if (finalY > 170) {
    doc.addPage();
    finalY = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Top 5 Scorers', 14, finalY);
  
  const topScorersData = topScorers.map((emp) => [
    emp.name,
    emp.department,
    emp.score
  ]);
  
  doc.autoTable({
    startY: finalY + 5,
    head: [['Name', 'Department', 'Score']],
    body: topScorersData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });
  
  // Employees with most pending tasks
  const pendingEmployees = getEmployeesByPendingTasks().slice(0, 5);
  let pendingY = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
  if (pendingY > 170) {
    doc.addPage();
    pendingY = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Top 5 Employees with Pending Tasks', 14, pendingY);
  
  const pendingData = pendingEmployees.map((emp) => [
    emp.name,
    emp.department,
    emp.pendingTasks,
    emp.totalTasks
  ]);
  
  doc.autoTable({
    startY: pendingY + 5,
    head: [['Name', 'Department', 'Pending Tasks', 'Total Tasks']],
    body: pendingData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] }
  });
  
  // Add new page for department scores
  doc.addPage();
  
  // Department scores
  doc.setFontSize(14);
  doc.text('Department Scores', 14, 15);
  
  const departmentData = departments.map((dept) => [
    dept.name,
    dept.employeeCount,
    dept.averageScore.toFixed(1)
  ]);
  
  doc.autoTable({
    startY: 20,
    head: [['Department', 'Number of Employees', 'Average Score']],
    body: departmentData,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] }
  });
  
  // Lowest scorers
  const lowestScorers = getLowestScorers(5);
  const lowestY = doc.lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (lowestY > 170) {
    doc.addPage();
    lowestY = 20;
  }

  doc.setFontSize(14);
  doc.text('5 Lowest Scoring Employees', 14, lowestY);
  
  const lowestData = lowestScorers.map((emp) => [
    emp.name,
    emp.department,
    emp.score
  ]);
  
  doc.autoTable({
    startY: lowestY + 5,
    head: [['Name', 'Department', 'Score']],
    body: lowestData,
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);

    const part1 = `Page ${i} of ${pageCount} - Powered by `;
    const part2 = "Botivate";
    
    const width1 = doc.getTextWidth(part1);
    const width2 = doc.getTextWidth(part2);
    const totalWidth = width1 + width2 ;
    
    const startX = (pageWidth - totalWidth) / 2;
    
    doc.setTextColor(100); // Grey/Black
    doc.text(part1, startX, 200);
    
    doc.setTextColor(37, 99, 235); // Blue color for link
    doc.text(part2, startX + width1, 200);
    
    doc.link(startX + width1, 197.5, width2, 3, { url: 'https://www.botivate.in' });
    
  }
  
  // Save the PDF
  doc.save('MIS-Dashboard-Report.pdf');
};