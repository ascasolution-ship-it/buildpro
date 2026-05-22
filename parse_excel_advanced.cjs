const xlsx = require('xlsx');

const wb = xlsx.readFile('sample_construction-schedule_v4-0.xlsx');
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

const parsedTasks = [];

for (let i = 8; i < data.length; i++) {
  const row = data[i];
  if (row && row[2]) {
    parsedTasks.push({
      wbsLevel: row[0],
      wbs: row[1],
      name: row[2],
      lead: row[3],
      budget: row[4],
      predecessor: row[5],
      start: row[6],
      end: row[7],
      workDays: row[8],
      percentDone: row[10],
    });
  }
}

console.log(JSON.stringify(parsedTasks.slice(0, 5), null, 2));
