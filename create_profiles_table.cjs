const { Client } = require('pg');

const config = {
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.uftbpsdkziaygbqlsmtq',
  password: 'Sonyah1212$.',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function main() {
  const client = new Client(config);
  await client.connect();
  console.log("Connected to Supabase PostgreSQL pooler.");
  
  // SQL queries to build profiles table and automatic triggers
  const query = `
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      company_name TEXT,
      subscription_status TEXT DEFAULT 'inactive',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan_type TEXT DEFAULT 'none',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
    
    -- Enable Row Level Security (RLS)
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for profiles
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    CREATE POLICY "Users can view their own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
      
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);

    -- Create profile on signup trigger function
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, company_name, subscription_status, plan_type)
      VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', 'ASCA Solutions Builder'), 'inactive', 'none');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger for profile creation
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;
  
  await client.query(query);
  console.log("Profiles table, policies, trigger function, and trigger created successfully!");
  await client.end();
}

main().catch(err => {
  console.error("Error running database migrations:", err);
  process.exit(1);
});
