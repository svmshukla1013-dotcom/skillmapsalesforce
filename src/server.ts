import express from "express";
import pool from "./postgres";
import { connectSalesforce } from "./salesforce";



const app = express();
const PORT = 3000;

async function getSoftwareSkills() {
  const result = await pool.query(`
    SELECT *
    FROM software_skills
    LIMIT 100
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

async function syncSoftware(): Promise<number> {
  const rows = await getSoftwareSkills();
  const connection = connectSalesforce();

  let created = 0;

  for (const row of rows) {
    const existing = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Software__c
       WHERE Name = '${row.software_name.replace(/'/g, "\\'")}'
      AND Occupation__r.Occupation_Code__c = '${row.onet_code.replace(/'/g, "\\'")}'
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
         console.log(`✅ Created: ${row.software_name}`);
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
    LIMIT 100
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
          Description__c: "Imported from O*NET",
        });

      if ((createResult as any).success) {
        created++;
        console.log(`✅ Created occupation: ${row.occupation_title}`);
      } else {
        console.log(`❌ Failed to create occupation: ${row.occupation_title}`);
      }
    } else {
      console.log(`⏩ Skipped: ${row.occupation_title}`);
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

async function syncEssentialSkills(): Promise<number> {
  const result = await pool.query(`
    SELECT
      occupation_code,
      skill_name,
      skill_description,
      importance
    FROM occupation_skills
    ORDER BY importance DESC
  `);

  const connection = connectSalesforce();
  let created = 0;

  for (const row of result.rows) {
    const occupationResult = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation__c
       WHERE Occupation_Code__c = '${row.occupation_code}'
       LIMIT 1`
    );

    const occupationId = occupationResult.records[0]?.Id;

    if (!occupationId) {
      console.log(
        `Occupation ${row.occupation_code} was not found in Salesforce.`
      );
      continue;
    }

    const safeSkillName = row.skill_name.replace(/'/g, "\\'");

    const existing = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation_Skill__c
       WHERE Name = '${safeSkillName}'
       AND Occupation__c = '${occupationId}'
       LIMIT 1`
    );

    if (existing.totalSize > 0) {
      console.log(`Skipped existing skill: ${row.skill_name}`);
      continue;
    }

    const createResult = await connection
      .sobject("Occupation_Skill__c")
      .create({
        Name: row.skill_name,
        Occupation__c: occupationId,
        Importance__c: row.importance,
        Skill_Description__c: row.skill_description,
      });

    if (createResult.success) {
      created++;
      console.log(`Created skill: ${row.skill_name}`);
    }
  }

  return created;
}

async function syncKnowledge(): Promise<number> {
  const result = await pool.query(`
    SELECT
      occupation_code,
      knowledge_name,
      knowledge_description,
      importance
    FROM occupation_knowledge
    ORDER BY importance DESC
  `);

  const connection = connectSalesforce();
  let created = 0;

  for (const row of result.rows) {
    const occupationResult = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation__c
       WHERE Occupation_Code__c = '${row.occupation_code}'
       LIMIT 1`
    );

    const occupationId = occupationResult.records[0]?.Id;

    if (!occupationId) {
      console.log(
        `Occupation ${row.occupation_code} was not found in Salesforce.`
      );
      continue;
    }

    const safeKnowledgeName = row.knowledge_name.replace(/'/g, "\\'");

    const existing = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation_Knowledge__c
       WHERE Name = '${safeKnowledgeName}'
       AND Occupation__c = '${occupationId}'
       LIMIT 1`
    );

    if (existing.totalSize > 0) {
      console.log(`Skipped existing knowledge: ${row.knowledge_name}`);
      continue;
    }

    const createResult = await connection
      .sobject("Occupation_Knowledge__c")
      .create({
        Name: row.knowledge_name,
        Occupation__c: occupationId,
        Importance__c: row.importance,
        Knowledge_Description__c: row.knowledge_description,
      });

    if (createResult.success) {
      created++;
      console.log(`Created knowledge: ${row.knowledge_name}`);
    }
  }

  return created;
}

async function syncAbilities(): Promise<number> {
  const result = await pool.query(`
    SELECT
      occupation_code,
      ability_name,
      ability_description,
      importance
    FROM occupation_abilities
    ORDER BY importance DESC
  `);

  const connection = connectSalesforce();
  let created = 0;

  for (const row of result.rows) {
    const occupationResult = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation__c
       WHERE Occupation_Code__c = '${row.occupation_code}'
       LIMIT 1`
    );

    const occupationId = occupationResult.records[0]?.Id;

    if (!occupationId) {
      console.log(
        `Occupation ${row.occupation_code} was not found in Salesforce.`
      );
      continue;
    }

    const safeAbilityName = row.ability_name.replace(/'/g, "\\'");

    const existing = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation_Ability__c
       WHERE Ability_Name__c = '${safeAbilityName}'
       AND Occupation__c = '${occupationId}'
       LIMIT 1`
    );

    if (existing.totalSize > 0) {
      console.log(`Skipped existing ability: ${row.ability_name}`);
      continue;
    }

    const createResult = await connection
      .sobject("Occupation_Ability__c")
      .create({
        Ability_Name__c: row.ability_name,
        Occupation__c: occupationId,
        Importance__c: row.importance,
        Ability_Description__c: row.ability_description,
      });

    if (createResult.success) {
      created++;
      console.log(`Created ability: ${row.ability_name}`);
    }
  }

  return created;
}

async function syncTasks(): Promise<number> {
  const result = await pool.query(`
    SELECT
      occupation_code,
      task_statement,
      importance,
      category
    FROM occupation_tasks
    ORDER BY importance DESC
  `);

  const connection = connectSalesforce();
  let created = 0;

  for (const row of result.rows) {
    const occupationResult = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation__c
       WHERE Occupation_Code__c = '${row.occupation_code}'
       LIMIT 1`
    );

    const occupationId = occupationResult.records[0]?.Id;

    if (!occupationId) {
      console.log(
        `Occupation ${row.occupation_code} was not found in Salesforce.`
      );
      continue;
    }

    const taskName = row.task_statement
  .replace(/\r?\n/g, " ")
  .substring(0, 80);

const safeTaskName = taskName
  .replace(/\\/g, "\\\\")
  .replace(/'/g, "\\'");

const existing = await connection.query<{ Id: string }>(
  `SELECT Id
   FROM Occupation_Task__c
   WHERE Name = '${safeTaskName}'
   AND Occupation__c = '${occupationId}'
   LIMIT 1`
);

    if (existing.totalSize > 0) {
      console.log(`Skipped existing task: ${row.task_statement}`);
      continue;
    }

    const createResult = await connection
      .sobject("Occupation_Task__c")
      .create({
        Name: taskName,
        Occupation__c: occupationId,
        Occupation_Task__c: row.task_statement,
        Importance__c: row.importance,
        Category__c: row.category,
      });

    if (createResult.success) {
      created++;
      console.log(`Created task: ${row.task_statement}`);
    }
  }

  return created;
}

async function syncWorkContext(): Promise<number> {
  const result = await pool.query(`
    SELECT
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
    FROM occupation_work_context
    ORDER BY context_name
  `);

  const connection = connectSalesforce();
  let created = 0;

  for (const row of result.rows) {
    const occupationResult = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation__c
       WHERE Occupation_Code__c = '${row.occupation_code}'
       LIMIT 1`
    );

    const occupationId = occupationResult.records[0]?.Id;

    if (!occupationId) {
      console.log(
        `Occupation ${row.occupation_code} was not found in Salesforce.`
      );
      continue;
    }

    const safeContext = row.context_name
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");

    const existing = await connection.query<{ Id: string }>(
      `SELECT Id
       FROM Occupation_Work_Context__c
       WHERE Work_Context__c = '${safeContext}'
       AND Occupation__c = '${occupationId}'
       LIMIT 1`
    );

    if (existing.totalSize > 0) {
      console.log(`Skipped existing work context: ${row.context_name}`);
      continue;
    }

    const createResult = await connection
      .sobject("Occupation_Work_Context__c")
      .create({
        Occupation__c: occupationId,
        Work_Context__c: row.context_name,
        Work_Context_Description__c: row.context_description,

        Response1_Percentage_c__c: row.response_1_percentage,
        Response1_Description_c__c: row.response_1_description,

        Response2_Percentage_c__c: row.response_2_percentage,
        Response2_Description_c__c: row.response_2_description,

        Response3_Percentage_c__c: row.response_3_percentage,
        Response3_Description_c__c: row.response_3_description,

        Response4_Percentage_c__c: row.response_4_percentage,
        Response4_Description_c__c: row.response_4_description,

        Response5_Percentage_c__c: row.response_5_percentage,
        Response5_Description_c__c: row.response_5_description,
      });

    if (createResult.success) {
      created++;
      console.log(`Created work context: ${row.context_name}`);
    } else {
      console.log(createResult.errors);
    }
  }

  return created;
}-+ 

app.get("/sync/skills", async (_req, res) => {
  try {
    const created = await syncEssentialSkills();

    res.json({
      message: "Essential Skills sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("SKILLS SYNC ERROR:", error);

    res.status(500).json({
      message: "Essential Skills sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/sync/abilities", async (_req, res) => {
  try {
    const created = await syncAbilities();

    res.json({
      message: "Abilities sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("ABILITIES SYNC ERROR:", error);

    res.status(500).json({
      message: "Abilities sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/sync/knowledge", async (_req, res) => {
  try {
    const created = await syncKnowledge();

    res.json({
      message: "Knowledge sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("KNOWLEDGE SYNC ERROR:", error);

    res.status(500).json({
      message: "Knowledge sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/sync/work-context", async (_req, res) => {
  try {
    const created = await syncWorkContext();

    res.json({
      message: "Work Context sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("WORK CONTEXT SYNC ERROR:", error);

    res.status(500).json({
      message: "Work Context sync failed",
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

app.get("/sync/tasks", async (_req, res) => {
  try {
    const created = await syncTasks();

    res.json({
      message: "Tasks sync completed",
      recordsCreated: created,
    });
  } catch (error) {
    console.error("TASKS SYNC ERROR:", error);

    res.status(500).json({
      message: "Tasks sync failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});