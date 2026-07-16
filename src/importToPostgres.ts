import * as XLSX from "xlsx";
import pool from "./postgres";

interface SoftwareSkillRow {
  "O*NET-SOC Code": string;
  Title: string;
  "Workplace Example": string;
  "Element ID": string;
  "Element Name": string;
  "Hot Technology": "Y" | "N";
  "In Demand": "Y" | "N";
}

async function importData(): Promise<void> {
  try {
    const workbook = XLSX.readFile("./data/Software Skills.xlsx");

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("No worksheet found.");
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error("Worksheet could not be opened.");
    }

    const rows =
      XLSX.utils.sheet_to_json<SoftwareSkillRow>(worksheet);

    const firstTenRows = rows.slice(0, 10);

    for (const row of firstTenRows) {
      await pool.query(
        `
        INSERT INTO software_skills (
          onet_code,
          occupation_title,
          software_name,
          element_id,
          category,
          hot_technology,
          in_demand
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          row["O*NET-SOC Code"],
          row.Title,
          row["Workplace Example"],
          row["Element ID"],
          row["Element Name"],
          row["Hot Technology"] === "Y",
          row["In Demand"] === "Y",
        ]
      );
    }

    console.log(`${firstTenRows.length} rows inserted successfully.`);
  } catch (error) {
    console.error("Failed to import data:", error);
  } finally {
    await pool.end();
  }
}

importData();