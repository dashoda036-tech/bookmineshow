const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres.agomuekmwwxozqooymei:JxPnnaN581iikebi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    // 1. Check connection
    const time = await pool.query("SELECT NOW() AS current_time");
    console.log("✅ Connected to database");
    console.log("   Server time:", time.rows[0].current_time);

    // 2. Check customers table
    const table = await pool.query(`
      SELECT COUNT(*) AS total FROM information_schema.tables
      WHERE table_name = 'customers'
    `);
    const exists = parseInt(table.rows[0].total) > 0;
    console.log(exists ? "✅ Table 'customers' exists" : "⚠️  Table 'customers' does NOT exist");

    // 3. Row count
    if (exists) {
      const count = await pool.query("SELECT COUNT(*) AS total FROM customers");
      console.log("   Total records:", count.rows[0].total);
    }

  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
