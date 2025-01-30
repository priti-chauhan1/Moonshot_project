const XLSX = require('xlsx');
const fs = require('fs');

// Load the workbook
const workbook = XLSX.readFile('data.xlsx');

// Select the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Extract headers and rows
const headers = jsonData[0].slice(3); // Group names A, B, C, etc.
const rows = jsonData.slice(1);

// Helper to convert Excel serial date to readable format
function excelDateToJSDate(excelDate) {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Transform the data to a list of objects
const result = rows.map(row => {
  let [day, age, gender, ...groups] = row;

  // Convert Excel serial date to readable date if necessary
  if (typeof day === 'number') {
    day = excelDateToJSDate(day);
  }

  // Build the object
  const entry = { day, age, gender };
  headers.forEach((header, index) => {
    entry[header] = groups[index];
  });

  return entry;
});

// Save the result as JSON for review
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));

console.log("Data successfully structured and saved:", result);
