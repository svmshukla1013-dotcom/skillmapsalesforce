import pool from "./postgres";

async function createTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS software_skills (
        id SERIAL PRIMARY KEY,
        onet_code VARCHAR(20) NOT NULL,
        occupation_title VARCHAR(255) NOT NULL,
        software_name VARCHAR(255) NOT NULL,
        element_id VARCHAR(50) NOT NULL,
        category VARCHAR(255),
        hot_technology BOOLEAN DEFAULT FALSE,
        in_demand BOOLEAN DEFAULT FALSE
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_software_skills_business_key
      ON software_skills (onet_code, software_name, element_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS occupations (
        id SERIAL PRIMARY KEY,
        salesforce_id VARCHAR(18) UNIQUE,
        occupation_code VARCHAR(100) UNIQUE NOT NULL,
        occupation_name VARCHAR(80) NOT NULL,
        description TEXT
      );
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS occupation_skills (
    id SERIAL PRIMARY KEY,
    occupation_code VARCHAR(20) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_description TEXT,
    importance INTEGER,
    salesforce_id VARCHAR(18),
    UNIQUE (occupation_code, skill_name)
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS occupation_knowledge (
    id SERIAL PRIMARY KEY,
    occupation_code VARCHAR(20) NOT NULL,
    knowledge_name VARCHAR(255) NOT NULL,
    knowledge_description TEXT,
    importance INTEGER,
    salesforce_id VARCHAR(18)
  );
`);

await pool.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS unique_occupation_knowledge
  ON occupation_knowledge (
    occupation_code,
    knowledge_name
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS occupation_abilities (
    id SERIAL PRIMARY KEY,
    occupation_code VARCHAR(20) NOT NULL,
    ability_name VARCHAR(255) NOT NULL,
    ability_description TEXT,
    importance INTEGER,
    salesforce_id VARCHAR(18)
  );
`);

await pool.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS unique_occupation_abilities
  ON occupation_abilities (
    occupation_code,
    ability_name
  );
`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS software (
        id SERIAL PRIMARY KEY,
        salesforce_id VARCHAR(18) UNIQUE,
        software_name VARCHAR(80) UNIQUE NOT NULL,
        category VARCHAR(100),
        description VARCHAR(200),
        hot_technology BOOLEAN DEFAULT FALSE,
        in_demand BOOLEAN DEFAULT FALSE,
        vendor VARCHAR(100),
        version VARCHAR(100)
      );
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS occupation_tasks (
    id SERIAL PRIMARY KEY,
    occupation_code VARCHAR(20) NOT NULL,
    task_statement TEXT NOT NULL,
    importance INTEGER,
    category VARCHAR(50),
    salesforce_id VARCHAR(18)
  );
`);

await pool.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS unique_occupation_tasks
  ON occupation_tasks (
    occupation_code,
    task_statement
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS occupation_work_context (
    id SERIAL PRIMARY KEY,
    occupation_code VARCHAR(20) NOT NULL,
    context_name VARCHAR(255) NOT NULL,
    context_description TEXT,
    importance INTEGER,
    salesforce_id VARCHAR(18)
  );
`);

await pool.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS unique_occupation_work_context
  ON occupation_work_context (
    occupation_code,
    context_name
  );
`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS occupation_software (
        id SERIAL PRIMARY KEY,
        occupation_id INTEGER NOT NULL,
        software_id INTEGER NOT NULL,

        CONSTRAINT fk_occupation
          FOREIGN KEY (occupation_id)
          REFERENCES occupations(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_software
          FOREIGN KEY (software_id)
          REFERENCES software(id)
          ON DELETE CASCADE,

        CONSTRAINT unique_occupation_software
          UNIQUE (occupation_id, software_id)
      );
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS occupation_work_context (
    id SERIAL PRIMARY KEY,
    occupation_code VARCHAR(20) NOT NULL,
    context_name VARCHAR(255) NOT NULL,
    context_description TEXT,

    response_1_percentage NUMERIC(5,2),
    response_1_description TEXT,

    response_2_percentage NUMERIC(5,2),
    response_2_description TEXT,

    response_3_percentage NUMERIC(5,2),
    response_3_description TEXT,

    response_4_percentage NUMERIC(5,2),
    response_4_description TEXT,

    response_5_percentage NUMERIC(5,2),
    response_5_description TEXT,

    salesforce_id VARCHAR(18)
  );
`);

await pool.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS unique_occupation_work_context
  ON occupation_work_context (
    occupation_code,
    context_name
  );
`);

    console.log("Normalized tables created successfully.");
  } catch (error) {
    console.error("Failed to create normalized tables:", error);
  } finally {
    await pool.end();
  }
}

createTable();
