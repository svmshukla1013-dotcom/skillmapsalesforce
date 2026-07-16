import pool from "./postgres";

async function createTable(): Promise<void> {
  try {
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

    console.log("Normalized tables created successfully.");
  } catch (error) {
    console.error("Failed to create normalized tables:", error);
  } finally {
    await pool.end();
  }
}

createTable();