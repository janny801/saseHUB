// api/login.js

import "dotenv/config"; // allows .env locally
import { google } from "googleapis";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { uh_id } = req.body;

  if (!uh_id) {
    return res.status(400).json({ message: "Missing UH ID" });
  }

  try {
    // Build credentials from environment variables
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "Total Points Overview!A:F",
    });

    const rows = response.data.values || [];

    // Skip header row (start at index 1)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const firstName = row[0];
      const lastName = row[1];
      const email = row[2];
      const sheetUHID = row[3];
      const paidStatus = row[4];

      if (String(sheetUHID) === String(uh_id)) {
        if (!paidStatus || paidStatus.toLowerCase() !== "paid") {
          return res.status(403).json({
            message: "Membership unpaid — access denied",
          });
        }

        // SUCCESS
        return res.json({
          allowed: true,
          user: {
            uh_id: sheetUHID,
            first_name: firstName || null,
            last_name: lastName || null,
            email: email || null,
          },
        });
      }
    }

    // UH ID not found
    return res.status(403).json({
      message: "UH ID not found in membership records",
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
}
