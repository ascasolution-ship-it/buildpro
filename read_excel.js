import * as xlsx from 'xlsx';

const wb = xlsx.readFile('sample_construction-schedule_v4-0.xlsx');
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

console.log(data.slice(0, 20));
