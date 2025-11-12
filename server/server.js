import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Resolve absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files from the frontend folder
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ✅ Serve login.html as the default route
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// ✅ MySQL connection
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

// ✅ UH ID login route
app.post("/login", async (req, res) => {
  const { uh_id } = req.body;

  try {
    if (uh_id !== "2190662") {
      return res.status(403).json({ message: "Invalid UH ID" });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE uh_id = ?", [uh_id]);

    if (rows.length === 0) {
      await db.execute("INSERT INTO users (uh_id) VALUES (?)", [uh_id]);
      console.log(`🆕 Added UH ID ${uh_id} to database`);
    }

    res.json({ message: "Login successful", user: uh_id });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ✅ Fallback for unknown routes (must come AFTER all other routes)
app.use((req, res) => {
  res.status(404).sendFile(path.join(frontendPath, "login.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
