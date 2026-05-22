require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function recalculateDates() {
  const { data: projects } = await supabase.from('projects').select('id');
  if (!projects) return;

  for (const project of projects) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project.id);
      
    if (!tasks || tasks.length === 0) continue;

    // Create a map
    const taskMap = {};
    tasks.forEach(t => taskMap[t.wbs] = t);

    // Topological sort or simple iterative resolution
    // Since it's a tree/DAG, we can iterate until no changes are made
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      changed = false;
      iterations++;

      for (const task of tasks) {
        if (!task.predecessor) continue;
        
        const preds = task.predecessor.split(',').map(p => p.trim());
        let maxEndDay = task.start_day; // minimum is its current start day
        
        for (const p of preds) {
          const predTask = taskMap[p];
          if (predTask) {
            const predEndDay = predTask.start_day + predTask.duration_days;
            if (predEndDay > maxEndDay) {
              maxEndDay = predEndDay;
            }
          }
        }

        if (task.start_day !== maxEndDay) {
          task.start_day = maxEndDay;
          changed = true;
        }
      }
    }

    // Now push updates
    for (const task of tasks) {
      await supabase.from('tasks').update({ start_day: task.start_day }).eq('id', task.id);
    }
    console.log(`Recalculated dates for project ${project.id}`);
  }
}

recalculateDates().catch(console.error);
