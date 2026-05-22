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
  console.log("Connecting to PostgreSQL to confirm email and set subscription to active/pro...");
  const pgClient = new Client(pgConfig);
  await pgClient.connect();

  const email = 'soniahomellc@gmail.com';

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
    console.error("Could not find user in auth.users table. We will attempt direct SQL insert.");
    
    const insertUserQuery = `
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1,
        crypt('123455', gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"company_name": "Sonia Home LLC"}',
        NOW(),
        NOW()
      ) RETURNING id;
    `;
    const insertRes = await pgClient.query(insertUserQuery, [email]);
    const userId = insertRes.rows[0].id;
    console.log(`Created user with ID: ${userId}`);
    
    // Now upsert profiles
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
    console.log("User profile created successfully!");

  } else {
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
  }

  await pgClient.end();
  console.log("Account setup complete!");
}

main().catch(err => {
  console.error("Process failed:", err);
  process.exit(1);
});
