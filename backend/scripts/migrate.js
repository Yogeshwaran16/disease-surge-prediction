require("dotenv").config({ path: require("path").resolve(process.cwd(), "backend/.env") });

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function runMigrations() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB database connection is not available.");
  }

  const migrationsCollection = db.collection("schema_migrations");

  await migrationsCollection.createIndex(
    { version: 1 },
    { unique: true }
  );

  const applied = await migrationsCollection
    .find({})
    .sort({ version: 1 })
    .toArray();

  const appliedVersions = new Set(
    applied.map((migration) => migration.version)
  );

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(
      (file) =>
        /^\d+_.*\.js$/.test(file) &&
        file !== path.basename(__filename)
    )
    .sort();

  for (const file of migrationFiles) {
    const migration = require(path.join(MIGRATIONS_DIR, file));

    if (!migration.version || typeof migration.up !== "function") {
      throw new Error(`Invalid migration file: ${file}`);
    }

    if (appliedVersions.has(migration.version)) {
      console.log(`SKIP ${migration.version} - ${migration.name || file}`);
      continue;
    }

    console.log(`APPLY ${migration.version} - ${migration.name || file}`);

    await migration.up(db);

    await migrationsCollection.insertOne({
      version: migration.version,
      name: migration.name || file,
      applied_at: new Date(),
    });

    console.log(`DONE ${migration.version}`);
  }

  console.log("Migration process completed.");
}

runMigrations()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
