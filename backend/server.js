const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "https://frontend-one-khaki-53.vercel.app" }));
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://postgres.agomuekmwwxozqooymei:JxPnnaN581iikebi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    match TEXT DEFAULT 'Unknown',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
  )
`).then(() => console.log("DB ready")).catch(err => console.error("DB init error:", err.message));

// Save customer info
app.post("/api/customers", async (req, res) => {
  const { fullName, email, phone, match } = req.body;
  if (!fullName || !email || !phone) return res.status(400).json({ error: "Missing fields" });

  try {
    await pool.query(
      "INSERT INTO customers (full_name, email, phone, match) VALUES ($1, $2, $3, $4)",
      [fullName, email, phone, match || "Unknown"]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "adminadmin") {
    res.json({ success: true, token: "admin-token-123" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get all customers (protected)
app.get("/api/customers", async (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== "Bearer admin-token-123") return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY submitted_at DESC");
    const customers = result.rows.map(r => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      match: r.match,
      submittedAt: r.submitted_at
    }));
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
