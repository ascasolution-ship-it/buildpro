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

  // Get or create project
  let { data: projects } = await supabase.from('projects').select('id').limit(1);
  let projectId;
  if (!projects || projects.length === 0) {
    const { data: newProj, error } = await supabase.from('projects').insert([{
      name: 'Home Construction Project',
      location: 'Main Site',
      budget: 100000,
      status: 'Planning',
      progress: 0
    }]).select();
    if (error) throw error;
    projectId = newProj[0].id;
  } else {
    projectId = projects[0].id;
  }

  // Find min start date
  let minExcelDate = Infinity;
  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (row && row[2] && typeof row[6] === 'number') {
      if (row[6] < minExcelDate) minExcelDate = row[6];
    }
  }

  if (minExcelDate === Infinity) minExcelDate = 0;

  const tasksToInsert = [];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  let colorIndex = 0;

  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (row && row[2]) {
      const taskName = row[2];
      const startDayNum = typeof row[6] === 'number' ? row[6] : minExcelDate;
      let startDay = startDayNum - minExcelDate;
      if (startDay < 0) startDay = 0;

      let durationDays = typeof row[8] === 'number' ? row[8] : 3;
      if (durationDays < 1) durationDays = 1;

      // Ensure no duplicates or bad data
      if (taskName.length > 0) {
        tasksToInsert.push({
          name: taskName,
          project_id: projectId,
          start_day: startDay,
          duration_days: durationDays,
          color: colors[colorIndex % colors.length]
        });
        colorIndex++;
      }
    }
  }

  console.log(`Inserting ${tasksToInsert.length} tasks...`);
  
  // Clear existing tasks for this project if you want to avoid duplicates
  await supabase.from('tasks').delete().eq('project_id', projectId);

  // Insert in chunks of 50
  for (let i = 0; i < tasksToInsert.length; i += 50) {
    const chunk = tasksToInsert.slice(i, i + 50);
    const { error } = await supabase.from('tasks').insert(chunk);
    if (error) {
      console.error('Error inserting chunk:', error.message);
    }
  }

  console.log('Done seeding tasks!');
}

seed().catch(console.error);
