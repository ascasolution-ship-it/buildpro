require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createProject() {
  console.log("Creating new project: Duplex de Ejemplo...");
  
  // 1. Create Project
  const { data: newProject, error: projErr } = await supabase
    .from('projects')
    .insert([{
      name: 'Duplex de Ejemplo',
      location: '123 Main St, Miami FL',
      status: 'Planning',
      progress: 0,
      budget: 850000,
      color: '#3b82f6'
    }])
    .select('*')
    .single();

  if (projErr) {
    console.error("Error creating project:", projErr.message);
    return;
  }
  
  const projectId = newProject.id;
  console.log(`Created project with ID: ${projectId}`);

  // 2. Add Documents
  console.log("Adding standard documentation...");
  const dummyDocs = [
    { name: 'Contrato Principal Duplex.pdf', category: 'Contracts', file_type: 'PDF', size_mb: '2.4', file_url: '#' },
    { name: 'Planos Estructurales v1.pdf', category: 'Blueprints', file_type: 'PDF', size_mb: '15.6', file_url: '#' },
    { name: 'Permisos Municipales Aprobados.pdf', category: 'Other', file_type: 'PDF', size_mb: '1.2', file_url: '#' },
    { name: 'Presupuesto Inicial Materiales.xlsx', category: 'Estimates', file_type: 'Excel', size_mb: '0.8', file_url: '#' }
  ];

  for (const doc of dummyDocs) {
    await supabase.from('documents').insert([{ ...doc, project_id: projectId }]);
  }
  console.log("Documents added.");

  // 3. Clone Schedule from Excel
  console.log("Cloning master schedule template from Excel...");
  const wb = xlsx.readFile('sample_construction-schedule_v4-0.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

  let minExcelDate = Infinity;
  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (row && row[2] && typeof row[6] === 'number') {
      if (row[6] < minExcelDate) minExcelDate = row[6];
    }
  }
  if (minExcelDate === Infinity) minExcelDate = 0;

  const tasksToInsert = [];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#14b8a6', '#f43f5e'];
  let colorIndex = 0;

  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (row && row[2]) {
      const taskName = row[2];
      if (taskName.length === 0) continue;
      
      const wbsLevel = row[0] || 2;
      const wbs = row[1] ? String(row[1]) : '';
      const predecessor = row[5] ? String(row[5]) : null;
      
      const startDayNum = typeof row[6] === 'number' ? row[6] : minExcelDate;
      let startDay = startDayNum - minExcelDate;
      if (startDay < 0) startDay = 0;

      let durationDays = typeof row[8] === 'number' ? row[8] : 3;
      if (durationDays < 1) durationDays = 1;

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

  // Insert tasks in chunks
  console.log(`Inserting ${tasksToInsert.length} tasks...`);
  for (let i = 0; i < tasksToInsert.length; i += 50) {
    const chunk = tasksToInsert.slice(i, i + 50);
    const { error } = await supabase.from('tasks').insert(chunk);
    if (error) console.error('Error inserting chunk:', error.message);
  }

  // 4. Auto-Calculate Critical Path (Waterfall cascade)
  console.log("Recalculating dates based on dependencies (Waterfall)...");
  const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
  
  if (tasks && tasks.length > 0) {
    const taskMap = {};
    tasks.forEach(t => taskMap[t.wbs] = t);

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      changed = false;
      iterations++;

      for (const task of tasks) {
        if (!task.predecessor) continue;
        const preds = task.predecessor.split(',').map(p => p.trim());
        let maxEndDay = task.start_day;
        
        for (const p of preds) {
          const predTask = taskMap[p];
          if (predTask) {
            const predEndDay = predTask.start_day + predTask.duration_days;
            if (predEndDay > maxEndDay) maxEndDay = predEndDay;
          }
        }

        if (task.start_day !== maxEndDay) {
          task.start_day = maxEndDay;
          changed = true;
        }
      }
    }

    // Push updates
    for (const task of tasks) {
      await supabase.from('tasks').update({ start_day: task.start_day }).eq('id', task.id);
    }
  }

  console.log("Success! Duplex de Ejemplo is fully created with documents and schedule.");
}

createProject().catch(console.error);
