const { Client } = require('pg');

const pgConfig = {
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.uftbpsdkziaygbqlsmtq',
  password: 'Sonyah1212$.',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function main() {
  console.log("Connecting to PostgreSQL to create change_requests table...");
  const pgClient = new Client(pgConfig);
  await pgClient.connect();

  const query = `
    CREATE TABLE IF NOT EXISTS public.change_requests (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      request_type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
    
    -- Enable RLS
    ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
    
    -- Policies
    DROP POLICY IF EXISTS "Users can insert their own requests" ON public.change_requests;
    CREATE POLICY "Users can insert their own requests" ON public.change_requests
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    DROP POLICY IF EXISTS "Users can view their own requests" ON public.change_requests;
    CREATE POLICY "Users can view their own requests" ON public.change_requests
      FOR SELECT USING (auth.uid() = user_id);
  `;

  await pgClient.query(query);
  console.log("change_requests table and policies created successfully!");
  await pgClient.end();
}

main().catch(err => {
  console.error("Process failed:", err);
  process.exit(1);
});
