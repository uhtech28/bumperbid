const Task = require("../models/Task");
const Report = require("../models/Report");
const { generateTaskReportPDF } = require("../utils/pdfGenerator");
const { exportToCSV } = require("../utils/csvExporter");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ===============================
// Generate Task PDF Report
// ===============================
exports.generateTaskReport = catchAsync(async (req, res) => {
  const tasks = await Task.find({ isDeleted: false });

  const filename = `task-report-${Date.now()}.pdf`;
  const filePath = await generateTaskReportPDF(tasks, filename);

  const report = await Report.create({
    name: "Task Report",
    type: "pdf",
    generatedBy: req.user._id,
    filePath,
  });

  res.json({
    message: "PDF report generated successfully",
    report,
    download: `/api/reports/download/${report._id}`,
  });
});

// ===============================
// Export Tasks CSV
// ===============================
exports.exportTasksCSV = catchAsync(async (req, res) => {
  const tasks = await Task.find({ isDeleted: false }).lean();

  const filename = `tasks-${Date.now()}.csv`;
  const filePath = await exportToCSV(tasks, filename);

  const report = await Report.create({
    name: "Task CSV Export",
    type: "csv",
    generatedBy: req.user._id,
    filePath,
  });

  res.json({
    message: "CSV exported successfully",
    report,
    download: `/api/reports/download/${report._id}`,
  });
});

// ===============================
// Download Report
// ===============================
exports.downloadReport = catchAsync(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  res.download(report.filePath);
});
