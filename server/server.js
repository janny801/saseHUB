import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//check membership status
import { google } from "googleapis";
import fs from "fs";

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

/* -------------------------------------------------------------
   GOOGLE SHEETS SETUP
------------------------------------------------------------- */

const GOOGLE_CREDENTIALS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "google-credentials.json"))
);

const sheetsClient = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const SHEET_ID = "12RRoG2vbwhmkEkcdeF4Fd8PiMx5k04Sj_suPOdIbZxM";
const SHEET_RANGE = "Total Points Overview!A:F";

async function getMemberFromSheet(uh_id) {
  try {
    const auth = await sheetsClient.getClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const firstName = row[0];
      const lastName = row[1];
      const email = row[2];
      const sheetUHID = row[3];
      const paidStatus = row[4];

      if (String(sheetUHID) === String(uh_id)) {
        return {
          uh_id: sheetUHID,
          first_name: firstName || null,
          last_name: lastName || null,
          email: email || null,
          paid: paidStatus && paidStatus.toLowerCase() === "paid"
        };
      }
    }

    return null;
  } catch (err) {
    console.error("❌ Error reading Google Sheet:", err);
    return null;
  }
}

/* -------------------------------------------------------------
   LOGIN (NOW CHECKS GOOGLE SHEET)
------------------------------------------------------------- */

app.post("/login", async (req, res) => {
  const { uh_id } = req.body;

  if (!uh_id) {
    return res.status(400).json({ message: "Missing UH ID" });
  }

  try {
    console.log("🔍 Login attempt UH ID:", uh_id);

    // -----------------------------------------------------
    // 1️⃣ CHECK MYSQL FIRST — is this user already registered?
    // -----------------------------------------------------
    const [rows] = await db.execute(
      "SELECT uh_id, first_name, last_name, email, linkedin, admin FROM users WHERE uh_id = ?",
      [uh_id]
    );

    if (rows.length > 0) {
      // ✔ Existing user → SKIP Google Sheet check completely
      console.log("➡ Existing user detected — skipping Google Sheet check!");

      const existingUser = rows[0];

      return res.json({
        message: "Login successful",
        user: existingUser
      });
    }

    // -----------------------------------------------------
    // 2️⃣ NEW USER → CHECK GOOGLE SHEET
    // -----------------------------------------------------
    const sheetMember = await getMemberFromSheet(uh_id);

    if (!sheetMember) {
      console.log("❌ UH ID not found in Google Sheet");
      return res.status(403).json({ message: "UH ID not found in membership records" });
    }

    if (!sheetMember.paid) {
      console.log("❌ Member is UNPAID");
      return res.status(403).json({ message: "Membership unpaid — access denied" });
    }

    console.log("✅ Paid NEW member found in sheet:", sheetMember.first_name, sheetMember.last_name);

    // -----------------------------------------------------
    // 3️⃣ INSERT NEW USER INTO MYSQL USING SHEET DATA
    // -----------------------------------------------------
    await db.execute(
      "INSERT INTO users (uh_id, first_name, last_name, email, admin) VALUES (?, ?, ?, ?, ?)",
      [
        sheetMember.uh_id,
        sheetMember.first_name,
        sheetMember.last_name,
        sheetMember.email,
        0
      ]
    );

    return res.json({
      message: "Login successful",
      user: {
        uh_id,
        first_name: sheetMember.first_name,
        last_name: sheetMember.last_name,
        email: sheetMember.email,
        linkedin: null,
        admin: 0
      }
    });

  } catch (err) {
    console.error("❌ Error during login:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

/* -------------------------------------------------------------
   GET PROFILE
------------------------------------------------------------- */

app.get("/get-profile", async (req, res) => {
  const { uh_id } = req.query;
  if (!uh_id) return res.status(400).json({ message: "Missing UH ID" });

  try {
    const [rows] = await db.execute(
      "SELECT first_name, last_name, email, linkedin, admin, memberPoints FROM users WHERE uh_id = ?",
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

/* -------------------------------------------------------------
   UPDATE PROFILE
------------------------------------------------------------- */

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

/* -------------------------------------------------------------
   GET ALL ALUMNI
------------------------------------------------------------- */

app.get("/alumni/all", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, full_name, company, role_title, email, linkedin, other_link, industries, profile_pic, company_img, created_at FROM alumni"
    );

    return res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching alumni:", err);
    return res.status(500).json({ message: "Server error fetching alumni" });
  }
});

/* -------------------------------------------------------------
   GET ALL PROFESSORS
------------------------------------------------------------- */

app.get("/professors/all", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, professor_name, tags, bio, email, profile_pic, created_at FROM professors"
    );

    return res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching professors:", err);
    return res.status(500).json({ message: "Server error fetching professors" });
  }
});

/* -------------------------------------------------------------
   START SERVER
------------------------------------------------------------- */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);