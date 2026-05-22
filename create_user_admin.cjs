require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const pgConfig = {
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.uftbpsdkziaygbqlsmtq',
  password: 'Sonyah1212$.',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function main() {
  console.log("1. Signing up user soniahomellc@gmail.com in Supabase...");
  
  const email = 'soniahomellc@gmail.com';
  const password = '123455';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: 'Sonia Home LLC'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      console.log("User already exists in auth. Carrying on to database updates...");
    } else {
      console.error("Sign up error:", error.message);
      process.exit(1);
    }
  } else {
    console.log("Sign up initial request succeeded. User ID:", data?.user?.id);
  }

  console.log("2. Connecting to PostgreSQL to confirm email and set subscription to active/free...");
  const pgClient = new Client(pgConfig);
  await pgClient.connect();

  // Update auth.users to confirm email
  const confirmQuery = `
    UPDATE auth.users
    SET 
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE email = $1
    RETURNING id;
  `;
  const res = await pgClient.query(confirmQuery, [email]);
  
  if (res.rows.length === 0) {
    console.error("Could not find user in auth.users table.");
    await pgClient.end();
    process.exit(1);
  }

  const userId = res.rows[0].id;
  console.log(`Confirmed email for user ID: ${userId}`);

  // Update public.profiles to set active subscription
  const profileQuery = `
    INSERT INTO public.profiles (id, company_name, subscription_status, plan_type, updated_at)
    VALUES ($1, 'Sonia Home LLC', 'active', 'pro', NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
      company_name = 'Sonia Home LLC',
      subscription_status = 'active',
      plan_type = 'pro',
      updated_at = NOW();
  `;
  await pgClient.query(profileQuery, [userId]);
  console.log("User profile updated to active/pro subscription successfully!");

  await pgClient.end();
  console.log("Account setup complete!");
}

main().catch(err => {
  console.error("Process failed:", err);
  process.exit(1);
});
