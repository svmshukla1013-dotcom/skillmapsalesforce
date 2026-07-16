import express from "express";
import pool from "./postgres";

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

app.get("/", async (_req, res) => {
  const softwareSkills = await getSoftwareSkills();
  res.json(softwareSkills);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});