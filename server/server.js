import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Resolve absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Default route → login
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// MySQL connection
let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log("✅ Connected to MySQL (sasehub)");
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err);
  }
})();


// -------------------------------------------------------------
// LOGIN (returns admin flag too)
// -------------------------------------------------------------
app.post("/login", async (req, res) => {
  const { uh_id } = req.body;

  if (!uh_id) {
    return res.status(400).json({ message: "Missing UH ID" });
  }

  try {
    // Look for user
    const [rows] = await db.execute(
      "SELECT uh_id, first_name, last_name, email, linkedin, admin FROM users WHERE uh_id = ?",
      [uh_id]
    );

    // NEW DEBUG LOG
    console.log("🔍 Login attempt UH ID:", uh_id);

    // If new user → create with admin = 0
    if (rows.length === 0) {
      console.log("➕ New user created (admin = 0)");

      await db.execute(
        "INSERT INTO users (uh_id, admin) VALUES (?, ?)",
        [uh_id, 0]
      );

      console.log("Returned admin = 0 for:", uh_id);

      return res.json({
        message: "Login successful",
        user: {
          uh_id,
          first_name: null,
          last_name: null,
          email: null,
          linkedin: null,
          admin: 0,
        },
      });
    }

    // Existing user
    const user = rows[0];

    // NEW DEBUG LOGS
    console.log("✅ Existing user found:", user.uh_id);
    console.log("   → first_name:", user.first_name);
    console.log("   → last_name:", user.last_name);
    console.log("   → email:", user.email);
    console.log("   → admin:", user.admin);

    return res.json({
      message: "Login successful",
      user: user,
    });

  } catch (err) {
    console.error("❌ Error during login:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});
// -------------------------------------------------------------
// GET PROFILE
// -------------------------------------------------------------
app.get("/get-profile", async (req, res) => {
  const { uh_id } = req.query;
  if (!uh_id) return res.status(400).json({ message: "Missing UH ID" });

  try {
    const [rows] = await db.execute(
      "SELECT first_name, last_name, email, linkedin, admin FROM users WHERE uh_id = ?",
      [uh_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
});


// -------------------------------------------------------------
// UPDATE PROFILE
// -------------------------------------------------------------
app.post("/update-profile", async (req, res) => {
  const { uh_id, first_name, last_name, email, linkedin } = req.body;

  if (!uh_id) {
    return res.status(400).json({ message: "Missing UH ID" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, linkedin = ? WHERE uh_id = ?",
      [first_name, last_name, email, linkedin, uh_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Updated profile for UH ID ${uh_id}`);
    return res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
});


// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);