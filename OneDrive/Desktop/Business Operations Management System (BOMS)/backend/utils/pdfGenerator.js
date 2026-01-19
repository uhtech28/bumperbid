const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateTaskReportPDF = async (data, filename) => {
  const reportsDir = path.join(__dirname, "../uploads/reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, filename);

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(20).text("UH TECH - Task Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Generated At: ${new Date().toLocaleString()}`);
  doc.moveDown();

  data.forEach((task, index) => {
    doc.text(`${index + 1}. ${task.title}`);
    doc.text(`Status: ${task.status}`);
    doc.text(`Priority: ${task.priority}`);
    doc.text(`Deadline: ${task.deadline || "N/A"}`);
    doc.moveDown();
  });

  doc.end();

  return filePath;
};
