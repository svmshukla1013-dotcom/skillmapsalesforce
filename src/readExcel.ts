import * as XLSX from "xlsx";

const filePath = "./data/Software Skills.xlsx";

const workbook = XLSX.readFile(filePath);

const sheetName = workbook.SheetNames[0];

if (!sheetName) {
  throw new Error("No worksheet was found in the Excel file.");
}

const worksheet = workbook.Sheets[sheetName];

if (!worksheet) {
  throw new Error(`Worksheet "${sheetName}" could not be opened.`);
}

const data = XLSX.utils.sheet_to_json(worksheet);

console.log(data.slice(0, 10));