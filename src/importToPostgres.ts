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

interface EssentialSkillRow {
  Importance: number;
  "Essential Skill": string;
  "Essential Skill Description": string;
}

interface KnowledgeRow {
  Importance: number;
  Knowledge: string;
  "Knowledge Description": string;
}

interface AbilityRow {
  Importance: number;
  Ability: string;
  "Ability Description": string;
}

interface TaskRow {
  Importance: number;
  Category: string;
  Task: string;
}

interface WorkContextRow {
  "Work Context": string;
  "Work Context Description": string;
  "Response 1 Percentage"?: number;
  "Response 1 Description"?: string;
  "Response 2 Percentage"?: number;
  "Response 2 Description"?: string;
  "Response 3 Percentage"?: number;
  "Response 3 Description"?: string;
  "Response 4 Percentage"?: number;
  "Response 4 Description"?: string;
  "Response 5 Percentage"?: number;
  "Response 5 Description"?: string;
}

async function importSoftwareSkills(): Promise<void> {
  const workbook = XLSX.readFile("./data/Software Skills.xlsx");

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No worksheet found in the Software Skills file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Software Skills worksheet could not be opened.");
  }

  const rows =
    XLSX.utils.sheet_to_json<SoftwareSkillRow>(worksheet);

  const rowsToImport = rows.filter(
    (row) => row["O*NET-SOC Code"] === "13-2099.04"
  );

  let inserted = 0;

  for (const row of rowsToImport) {
    const result = await pool.query(
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
      ON CONFLICT (
        onet_code,
        software_name,
        element_id
      )
      DO NOTHING
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

    inserted += result.rowCount ?? 0;
  }

  console.log(
    `${inserted} additional software rows inserted successfully.`
  );
}

async function importEssentialSkills(): Promise<void> {
  const workbook = XLSX.readFile(
    "./data/Essential_Skills_13-2099-04.csv.csv"
  );

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No sheet found in the Essential Skills file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Essential Skills worksheet could not be opened.");
  }

  const rows =
    XLSX.utils.sheet_to_json<EssentialSkillRow>(worksheet);

  let inserted = 0;

  for (const row of rows) {
    const result = await pool.query(
      `
      INSERT INTO occupation_skills (
        occupation_code,
        skill_name,
        skill_description,
        importance
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (
        occupation_code,
        skill_name
      )
      DO NOTHING
      `,
      [
        "13-2099.04",
        row["Essential Skill"],
        row["Essential Skill Description"],
        row.Importance,
      ]
    );

    inserted += result.rowCount ?? 0;
  }

  console.log(
    `${inserted} essential skills inserted successfully.`
  );
}

async function runImports(): Promise<void> {
  try {
    await importSoftwareSkills();
    await importEssentialSkills();
    await importKnowledge();
    await importAbilities();
    await importTasks();
    await importWorkContext();
  } catch (error) {
    console.error(
      "Import failed:",
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    await pool.end();
  }
}

async function importKnowledge(): Promise<void> {
  const workbook = XLSX.readFile(
  "./data/Knowledge_13-2099-04.csv.csv"
);
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No sheet found in the Knowledge file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Knowledge worksheet could not be opened.");
  }

  
  
  const rows = XLSX.utils.sheet_to_json<KnowledgeRow>(worksheet);

  let inserted = 0;

  for (const row of rows) {
    const result = await pool.query(
      `
      INSERT INTO occupation_knowledge (
        occupation_code,
        knowledge_name,
        knowledge_description,
        importance
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (occupation_code, knowledge_name)
      DO NOTHING
      `,
      [
        "13-2099.04",
        row.Knowledge,
        row["Knowledge Description"],
        row.Importance,
      ]
    );

    inserted += result.rowCount ?? 0;
  }

  console.log(`${inserted} knowledge records inserted successfully.`);
}

async function importAbilities(): Promise<void> {
  const workbook = XLSX.readFile(
    "./data/Abilities_13-2099-04.csv.csv"
  );

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No sheet found in the Abilities file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Abilities worksheet could not be opened.");
  }

  const rows = XLSX.utils.sheet_to_json<AbilityRow>(worksheet);

  let inserted = 0;

  for (const row of rows) {
    const result = await pool.query(
      `
      INSERT INTO occupation_abilities (
        occupation_code,
        ability_name,
        ability_description,
        importance
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (occupation_code, ability_name)
      DO NOTHING
      `,
      [
        "13-2099.04",
        row.Ability,
        row["Ability Description"],
        row.Importance,
      ]
    );

    inserted += result.rowCount ?? 0;
  }

  console.log(`${inserted} ability records inserted successfully.`);
}

async function importTasks(): Promise<void> {
  const workbook = XLSX.readFile(
    "./data/Tasks_13-2099-04.csv (1).csv"
  );

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No sheet found in the Tasks file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Tasks worksheet could not be opened.");
  }

  const rows = XLSX.utils.sheet_to_json<TaskRow>(worksheet);

  let inserted = 0;

  for (const row of rows) {
    const result = await pool.query(
      `
      INSERT INTO occupation_tasks (
        occupation_code,
        task_statement,
        importance,
        category
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (occupation_code, task_statement)
      DO NOTHING
      `,
      [
        "13-2099.04",
        row.Task,
        row.Importance,
        row.Category,
      ]
    );

    inserted += result.rowCount ?? 0;
  }

  console.log(`${inserted} task records inserted successfully.`);
} 

async function importWorkContext(): Promise<void> {
  const workbook = XLSX.readFile(
    "./data/Work_Context_13-2099-04.csv.csv"
  );

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No sheet found in the Work Context file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Work Context worksheet could not be opened.");
  }

  const rows = XLSX.utils.sheet_to_json<WorkContextRow>(worksheet);

  let inserted = 0;

  for (const row of rows) {
    const result = await pool.query(
      `
      INSERT INTO occupation_work_context (
        occupation_code,
        context_name,
        context_description,
        response_1_percentage,
        response_1_description,
        response_2_percentage,
        response_2_description,
        response_3_percentage,
        response_3_description,
        response_4_percentage,
        response_4_description,
        response_5_percentage,
        response_5_description
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      ON CONFLICT (occupation_code, context_name)
      DO NOTHING
      `,
      [
        "13-2099.04",
        row["Work Context"],
        row["Work Context Description"],
        row["Response 1 Percentage"] ?? null,
        row["Response 1 Description"] ?? null,
        row["Response 2 Percentage"] ?? null,
        row["Response 2 Description"] ?? null,
        row["Response 3 Percentage"] ?? null,
        row["Response 3 Description"] ?? null,
        row["Response 4 Percentage"] ?? null,
        row["Response 4 Description"] ?? null,
        row["Response 5 Percentage"] ?? null,
        row["Response 5 Description"] ?? null,
      ]
    );

    inserted += result.rowCount ?? 0;
  }

  console.log(`${inserted} work context records inserted successfully.`);
}

runImports();