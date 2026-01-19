const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

exports.exportToCSV = async (data, filename) => {
  const parser = new Parser();
  const csv = parser.parse(data);

  const exportDir = path.join(__dirname, "..", "exports");

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const filePath = path.join(exportDir, filename);
  fs.writeFileSync(filePath, csv);

  return filePath;
};
