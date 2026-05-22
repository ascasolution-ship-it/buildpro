require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const wb = xlsx.readFile('sample_construction-schedule_v4-0.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

  // Get all projects
  let { data: projects } = await supabase.from('projects').select('id, name');
  if (!projects || projects.length === 0) {
    console.error("No projects found.");
    return;
  }

  let minExcelDate = Infinity;
  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (row && row[2] && typeof row[6] === 'number') {
      if (row[6] < minExcelDate) minExcelDate = row[6];
    }
  }
  if (minExcelDate === Infinity) minExcelDate = 0;

  for (const project of projects) {
    const projectId = project.id;
    console.log(`Processing project: ${project.name}`);

    const tasksToInsert = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#14b8a6', '#f43f5e'];
    let colorIndex = 0;

    for (let i = 8; i < data.length; i++) {
      const row = data[i];
      if (row && row[2]) {
        const taskName = row[2];
        const wbsLevel = row[0] || 2;
        const wbs = row[1] ? String(row[1]) : '';
        const predecessor = row[5] ? String(row[5]) : null;
        
        const startDayNum = typeof row[6] === 'number' ? row[6] : minExcelDate;
        let startDay = startDayNum - minExcelDate;
        if (startDay < 0) startDay = 0;

        let durationDays = typeof row[8] === 'number' ? row[8] : 3;
        if (durationDays < 1) durationDays = 1;

        if (taskName.length > 0) {
          tasksToInsert.push({
            name: taskName,
            project_id: projectId,
            start_day: startDay,
            duration_days: durationDays,
            color: colors[colorIndex % colors.length],
            wbs_level: wbsLevel,
            wbs: wbs,
            predecessor: predecessor,
            progress: 0
          });
          colorIndex++;
        }
      }
    }

    console.log(`  Clearing existing tasks for ${project.name}...`);
    await supabase.from('tasks').delete().eq('project_id', projectId);

    console.log(`  Inserting ${tasksToInsert.length} tasks...`);
    // Insert in chunks of 50
    for (let i = 0; i < tasksToInsert.length; i += 50) {
      const chunk = tasksToInsert.slice(i, i + 50);
      const { error } = await supabase.from('tasks').insert(chunk);
      if (error) {
        console.error('  Error inserting chunk:', error.message);
      }
    }
  }

  console.log('Done cloning tasks to all projects!');
}

seed().catch(console.error);
