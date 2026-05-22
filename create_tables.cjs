require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Fetching 'Duplex de Ejemplo' project to associate Daily Logs...");
  
  // Fetch "Duplex de Ejemplo" project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id')
    .eq('name', 'Duplex de Ejemplo')
    .single();

  let projectId = null;
  if (projErr || !project) {
    console.log("Duplex de Ejemplo project not found or error:", projErr?.message);
    const { data: allProjects } = await supabase.from('projects').select('id').limit(1);
    if (allProjects && allProjects.length > 0) {
      projectId = allProjects[0].id;
    }
  } else {
    projectId = project.id;
  }

  if (!projectId) {
    console.error("Error: No projects found in database. Create a project first.");
    process.exit(1);
  }

  console.log(`Using project ID: ${projectId}`);

  // 1. Seed Daily Logs
  console.log("Checking daily_logs table...");
  const { data: existingLogs, error: logsErr } = await supabase.from('daily_logs').select('id').limit(1);
  
  if (logsErr) {
    console.error("Error checking daily_logs table (it might not exist yet):", logsErr.message);
    console.log("\n>>> Action Required: Please run the SQL Script in Supabase SQL Editor first! <<<\n");
    process.exit(1);
  }

  if (existingLogs.length === 0) {
    console.log("Seeding daily logs...");
    const logs = [
      {
        project_id: projectId,
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
        weather: 'Sunny',
        temperature: '82°F',
        wind: '4 mph',
        notes: 'Excavation completed for the foundation. Soil tests approved by inspector. No incidents.',
        reported_by: 'Carlos M.',
        status: 'Approved',
        attachments: 3
      },
      {
        project_id: projectId,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 1 day ago
        weather: 'Heavy Rain',
        temperature: '68°F',
        wind: '15 mph',
        notes: 'Site flooded due to unexpected morning downpour. All heavy excavation operations suspended. Workers performed indoor equipment cleaning and safety training.',
        reported_by: 'Carlos M.',
        status: 'Pending Review',
        attachments: 2
      },
      {
        project_id: projectId,
        date: new Date().toISOString().split('T')[0], // Today
        weather: 'Cloudy',
        temperature: '75°F',
        wind: '6 mph',
        notes: 'Concrete pouring for foundation footings started at 7:00 AM. 4 ready-mix trucks delivered material. Compaction tests completed successfully.',
        reported_by: 'Carlos M.',
        status: 'Pending Review',
        attachments: 1
      }
    ];

    const { error: seedLogsErr } = await supabase.from('daily_logs').insert(logs);
    if (seedLogsErr) console.error("Error seeding daily logs:", seedLogsErr.message);
    else console.log("Daily logs seeded successfully!");
  } else {
    console.log("Daily logs already contain data. Skipping seeding.");
  }

  // 2. Seed Subcontractors
  console.log("Checking subcontractors table...");
  const { data: existingSubs, error: subsErr } = await supabase.from('subcontractors').select('id').limit(1);

  if (subsErr) {
    console.error("Error checking subcontractors table:", subsErr.message);
    process.exit(1);
  }

  if (existingSubs.length === 0) {
    console.log("Seeding subcontractors...");
    const subs = [
      { name: 'Apex Framing LLC', trade: 'Framing & Carpentry', rating: 4.8, phone: '(555) 123-4567', email: 'apex@example.com', status: 'Active' },
      { name: 'Volt Electrical Pro', trade: 'Electrical', rating: 4.9, phone: '(555) 987-6543', email: 'volt@example.com', status: 'Active' },
      { name: 'AquaFlow Plumbing', trade: 'Plumbing', rating: 4.5, phone: '(555) 456-7890', email: 'aqua@example.com', status: 'On-Hold' },
      { name: 'Titan Concrete Services', trade: 'Concrete & Masonry', rating: 4.7, phone: '(555) 321-7654', email: 'titan@example.com', status: 'Active' }
    ];

    const { error: seedSubsErr } = await supabase.from('subcontractors').insert(subs);
    if (seedSubsErr) console.error("Error seeding subcontractors:", seedSubsErr.message);
    else console.log("Subcontractors seeded successfully!");
  } else {
    console.log("Subcontractors already contain data. Skipping seeding.");
  }

  // 3. Seed Equipment
  console.log("Checking equipment table...");
  const { data: existingEq, error: eqErr } = await supabase.from('equipment').select('id').limit(1);

  if (eqErr) {
    console.error("Error checking equipment table:", eqErr.message);
    process.exit(1);
  }

  if (existingEq.length === 0) {
    console.log("Seeding equipment...");
    const equipmentList = [
      { name: 'CAT 320 Excavator', category: 'Heavy Machinery', location: 'Duplex de Ejemplo', status: 'In Use', next_service: '2026-06-15' },
      { name: 'Bobcat T76 Skid Steer', category: 'Compact', location: 'Duplex de Ejemplo', status: 'In Use', next_service: '2026-07-01' },
      { name: 'JLG Scissor Lift 2630ES', category: 'Lifts', location: 'Warehouse', status: 'Available', next_service: '2026-05-30' },
      { name: 'Honda EU3000iS Generator', category: 'Power', location: 'Warehouse', status: 'Maintenance', next_service: '2026-05-20' }
    ];

    const { error: seedEqErr } = await supabase.from('equipment').insert(equipmentList);
    if (seedEqErr) console.error("Error seeding equipment:", seedEqErr.message);
    else console.log("Equipment seeded successfully!");
  } else {
    console.log("Equipment already contain data. Skipping seeding.");
  }

  console.log("\nSeeding script complete!");
}

main().catch(console.error);
