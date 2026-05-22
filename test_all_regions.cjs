const { Client } = require('pg');
const dns = require('dns').promises;

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ca-central-1', 'sa-east-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  try {
    await dns.lookup(host);
  } catch (e) {
    return { region, status: 'DNS Resolution Failed' };
  }

  // Try ports 6543 and 5432
  for (const port of [6543, 5432]) {
    const c = new Client({
      host,
      port,
      user: 'postgres.uftbpsdkziaygbqlsmtq',
      password: 'Sonyah1212$.',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await c.connect();
      await c.end();
      return { region, port, status: 'SUCCESS' };
    } catch (err) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // Continue, wrong region
      } else {
        return { region, port, status: 'FAILED', error: err.message };
      }
    }
  }
  return { region, status: 'Tenant not found in this region' };
}

async function main() {
  console.log("Testing all pooler regions...");
  for (const region of regions) {
    const res = await testRegion(region);
    console.log(`Region ${region}:`, JSON.stringify(res));
    if (res.status === 'SUCCESS' || (res.status === 'FAILED' && !res.error.includes('tenant/user'))) {
      console.log(`>>> Found active region context:`, res);
    }
  }
}

main().catch(console.error);
