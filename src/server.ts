import express from "express";
import pool from "./postgres";
import { connectSalesforce } from "./salesforce";



const app = express();
const PORT = 3000;

async function getSoftwareSkills() {
  const result = await pool.query(`
    SELECT *
    FROM software_skills
    LIMIT 10
  `);

  return result.rows;
}

async function testSalesforce() {
  const connection = connectSalesforce();
  return await connection.identity();
}

app.get("/", (_req, res) => {
  res.send("SkillMap Salesforce Server Running");
});

app.get("/software", async (_req, res) => {
  const softwareSkills = await getSoftwareSkills();
  res.json(softwareSkills);
});

app.use(express.json());

app.get("/salesforce", async (_req, res) => {
  try {
    const user = await testSalesforce();
    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Salesforce connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function syncSoftware(): Promise<number> {
  const rows = await getSoftwareSkills();
  const connection = connectSalesforce();

  let created = 0;

  for (const row of rows.slice(0, 2)) {
    const existing = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Software__c
       WHERE Name = '${row.software_name.replace(/'/g, "\\'")}'
       LIMIT 1`
    );

    if (existing.totalSize === 0) {
      const occupationResult = await connection.query<{ Id: string }>(
        `SELECT Id
         FROM Occupation__c
         WHERE Occupation_Code__c = '${row.onet_code}'
         LIMIT 1`
      );

      const occupationId = occupationResult.records[0]?.Id;

      if (!occupationId) {
        console.log(`Occupation not found for ${row.software_name}`);
        continue;
      }

      const result = await connection.sobject("Software__c").create({
        Name: row.software_name,
        Category__c: row.category,
        Hot_Technology__c: row.hot_technology,
        In_Demand__c: row.in_demand,
        Vendor__c: "Unknown",
        Occupation__c: occupationId,
      });

      if (result.success) {
        created++;
      }
    }
  }

  return created;
}
async function syncOccupations(): Promise<number> {
  const result = await pool.query(`
    SELECT DISTINCT onet_code, occupation_title
    FROM software_skills
    ORDER BY onet_code
    LIMIT 2
  `);

  const connection = connectSalesforce();
  let created = 0;

  for (const row of result.rows) {
    const existing = await connection.query<{ Id: string }>(
      `SELECT Id FROM Occupation__c
       WHERE Occupation_Code__c = '${row.onet_code}'
       LIMIT 1`
    );

    if (existing.totalSize === 0) {
      const createResult = await connection
        .sobject("Occupation__c")
        .create({
          Name: row.occupation_title,
          Occupation_Code__c: row.onet_code,
          Description__c: "Imported from O*NET"
        });

      if (createResult.success) {
        created++;
      }
    }
  }

  return created;
}

app.get("/sync/occupations", async (_req, res) => {
  try {
    const created = await syncOccupations();

    res.json({
      message: "Occupation sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("OCCUPATION SYNC ERROR:", error);

    res.status(500).json({
      message: "Occupation sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/sync/software", async (_req, res) => {
  try {
    const created = await syncSoftware();

    res.json({
      message: "Software sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("SYNC ERROR:", error);

    res.status(500).json({
      message: "Software sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/sync/all", async (_req, res) => {
    const occupations = await syncOccupations();
    const software = await syncSoftware();

    res.json({
        occupations,
        software
    });
});

app.get("/sync/all", async (_req, res) => {
  try {
    const occupations = await syncOccupations();
    const software = await syncSoftware();

    res.json({
      message: "Full sync completed",
      occupationsCreated: occupations,
      softwareCreated: software,
    });
  } catch (error) {
    console.error("FULL SYNC ERROR:", error);

    res.status(500).json({
      message: "Full sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});