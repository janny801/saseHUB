import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

//used to store images
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//check membership status
import { google } from "googleapis";
import fs from "fs";

// NEW → Multer for file uploads
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(cors());
app.use(express.json());

// Resolve absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

app.use("/pages", express.static(path.join(frontendPath, "pages")));

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
      const totalPoints = row[5];

      if (String(sheetUHID) === String(uh_id)) {
        return {
          uh_id: sheetUHID,
          first_name: firstName || null,
          last_name: lastName || null,
          email: email || null,
          totalPoints: totalPoints || 0,
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

    const [rows] = await db.execute(
      "SELECT uh_id, first_name, last_name, email, linkedin, admin FROM users WHERE uh_id = ?",
      [uh_id]
    );

    if (rows.length > 0) {
      console.log("➡ Existing user detected — skipping Google Sheet check!");
      const existingUser = rows[0];

      return res.json({
        message: "Login successful",
        user: existingUser
      });
    }

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
      "SELECT first_name, last_name, email, linkedin, admin FROM users WHERE uh_id = ?",
      [uh_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found in database" });
    }

    const userData = rows[0];

    const sheetMember = await getMemberFromSheet(uh_id);

    const points = sheetMember
      ? Number(sheetMember.totalPoints) || 0
      : 0;

    return res.json({
      user: {
        ...userData,
        memberPoints: points
      }
    });

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

/* -------------------------------------------------------------
   GET ALL PROFESSORS — MULTIPLE MAJORS SUPPORT
------------------------------------------------------------- */
app.get("/professors/all", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        p.id,
        p.professor_name,
        p.email,
        p.university,
        p.description,
        p.profile_pic_url,
        GROUP_CONCAT(m.major_name ORDER BY m.major_name SEPARATOR ', ') AS majors,
        GROUP_CONCAT(m.id ORDER BY m.major_name SEPARATOR ',') AS major_ids
      FROM professors p
      LEFT JOIN professor_majors pm ON p.id = pm.professor_id
      LEFT JOIN majors m ON pm.major_id = m.id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching professors:", err);
    return res.status(500).json({ message: "Server error fetching professors" });
  }
});
/* -------------------------------------------------------------
   GET ALL MAJORS
------------------------------------------------------------- */
app.get("/majors/all", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, major_name, college_name FROM majors ORDER BY major_name"
    );

    return res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching majors:", err);
    return res.status(500).json({ message: "Server error fetching majors" });
  }
});

/* -------------------------------------------------------------
   ADD PROFESSOR — NOW USING MULTER
------------------------------------------------------------- */
app.post("/professors/add", upload.single("profile_pic"), async (req, res) => {
  try {
    console.log("📌 Add Professor — Body:", req.body);

    const {
      professor_name,
      email,
      university,
      description,
      major_ids // comma separated list
    } = req.body;

    if (!professor_name || !email || !university || !major_ids) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let profile_pic_url = null;

    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "sasehub_professors" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      profile_pic_url = uploaded.secure_url;
    }

    // Insert into professors table
    const [result] = await db.execute(
      `INSERT INTO professors (professor_name, email, university, description, profile_pic_url)
       VALUES (?, ?, ?, ?, ?)`,
      [professor_name, email, university, description, profile_pic_url]
    );

    const professorId = result.insertId;

    // Insert multiple majors into junction table
    const majorsList = major_ids.split(",").map((v) => v.trim());

    for (const majorId of majorsList) {
      await db.execute(
        "INSERT INTO professor_majors (professor_id, major_id) VALUES (?, ?)",
        [professorId, majorId]
      );
    }

    return res.json({
      message: "Professor added successfully",
      professor_id: professorId
    });

  } catch (err) {
    console.error("❌ Error adding professor:", err);
    return res.status(500).json({ message: "Server error adding professor" });
  }
});


/* -------------------------------------------------------------
   UPDATE PROFESSOR
------------------------------------------------------------- */

/* -------------------------------------------------------------
   UPDATE PROFESSOR — MULTIPLE MAJORS + OPTIONAL IMAGE
------------------------------------------------------------- */
app.post("/professors/update", upload.single("profile_pic"), async (req, res) => {
  console.log("📌 Update Professor — Body:", req.body);

  try {
    const {
      id,
      professor_name,
      email,
      university,
      description,
      major_ids // comma-separated major list
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing professor ID" });
    }

    let profile_pic_url = null;

    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "sasehub_professors" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      profile_pic_url = uploaded.secure_url;
    }

    /* -------- UPDATE BASE PROFESSOR INFO -------- */
    let query = `
      UPDATE professors 
      SET professor_name = ?, email = ?, university = ?, description = ?
    `;
    const values = [professor_name, email, university, description];

    if (profile_pic_url) {
      query += `, profile_pic_url = ?`;
      values.push(profile_pic_url);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    await db.execute(query, values);

    console.log("🛠 Updated base professor data.");

    /* -------- UPDATE MAJORS -------- */
    if (major_ids) {
      const majorsList = major_ids
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "");

      console.log("🔄 Updating majors:", majorsList);

      // Delete old
      await db.execute("DELETE FROM professor_majors WHERE professor_id = ?", [id]);

      // Insert new
      for (const majorId of majorsList) {
        await db.execute(
          "INSERT INTO professor_majors (professor_id, major_id) VALUES (?, ?)",
          [id, majorId]
        );
      }
    }

    return res.json({ message: "Professor updated successfully" });

  } catch (err) {
    console.error("❌ Error updating professor:", err);
    return res.status(500).json({ message: "Server error updating professor" });
  }
});



/* -------------------------------------------------------------
   DELETE PROFESSOR
------------------------------------------------------------- */

app.delete("/professors/delete/:id", async (req, res) => {
  try {
    const professorId = req.params.id;

    const [result] = await db.execute(
      "DELETE FROM professors WHERE id = ?",
      [professorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Professor not found" });
    }

    return res.json({ message: "Professor deleted successfully" });

  } catch (err) {
    console.error("❌ Error deleting professor:", err);
    return res.status(500).json({ message: "Server error deleting professor" });
  }
});


/* -------------------------------------------------------------
   SAVE PROFESSOR FOR USER
------------------------------------------------------------- */
app.post("/saved-professors/save", async (req, res) => {
  try {
    const { uh_id, professor_id } = req.body;

    if (!uh_id || !professor_id) {
      return res.status(400).json({ message: "Missing uh_id or professor_id" });
    }

    // Prevent duplicates
    const [existing] = await db.execute(
      "SELECT * FROM saved_professors WHERE uh_id = ? AND professor_id = ?",
      [uh_id, professor_id]
    );

    if (existing.length > 0) {
      return res.json({ message: "Professor already saved" });
    }

    await db.execute(
      "INSERT INTO saved_professors (uh_id, professor_id) VALUES (?, ?)",
      [uh_id, professor_id]
    );

    return res.json({ message: "Professor saved successfully" });
  } catch (err) {
    console.error("❌ Error saving professor:", err);
    return res.status(500).json({ message: "Server error saving professor" });
  }
});

/* -------------------------------------------------------------
   REMOVE SAVED PROFESSOR
------------------------------------------------------------- */
app.delete("/saved-professors/remove", async (req, res) => {
  try {
    const { uh_id, professor_id } = req.body;

    if (!uh_id || !professor_id) {
      return res.status(400).json({ message: "Missing uh_id or professor_id" });
    }

    await db.execute(
      "DELETE FROM saved_professors WHERE uh_id = ? AND professor_id = ?",
      [uh_id, professor_id]
    );

    return res.json({ message: "Professor unsaved successfully" });
  } catch (err) {
    console.error("❌ Error removing saved professor:", err);
    return res.status(500).json({ message: "Server error removing saved professor" });
  }
});

/* -------------------------------------------------------------
   GET SAVED PROFESSORS FOR USER
------------------------------------------------------------- */
app.get("/saved-professors/:uh_id", async (req, res) => {
  try {
    const { uh_id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        p.id,
        p.professor_name,
        p.email,
        p.university,
        p.description,
        p.profile_pic_url,
        GROUP_CONCAT(m.major_name ORDER BY m.major_name SEPARATOR ', ') AS majors
      FROM saved_professors sp
      JOIN professors p ON sp.professor_id = p.id
      LEFT JOIN professor_majors pm ON p.id = pm.professor_id
      LEFT JOIN majors m ON pm.major_id = m.id
      WHERE sp.uh_id = ?
      GROUP BY p.id
      `,
      [uh_id]
    );

    return res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching saved professors:", err);
    return res.status(500).json({ message: "Server error fetching saved professors" });
  }
});




/* -------------------------------------------------------------
   START SERVER
------------------------------------------------------------- */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);