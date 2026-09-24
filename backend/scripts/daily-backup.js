require("dotenv").config({
  path: require("path").resolve(process.cwd(), "backend/.env"),
});

const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not configured.");
  process.exit(1);
}

const MONGODUMP = "D:\\mongodb-database-tools-windows-x86_64-100.19.0\\mongodb-database-tools-windows-x86_64-100.19.0\\bin\\mongodump.exe";
const BACKUP_ROOT = path.resolve(process.cwd(), "backend/backups/daily");

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const outputDir = path.join(BACKUP_ROOT, timestamp);

fs.mkdirSync(outputDir, { recursive: true });

console.log(`Starting MongoDB backup: ${outputDir}`);

execFile(
  MONGODUMP,
  ["--uri", MONGO_URI, "--out", outputDir],
  { windowsHide: true },
  (error, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);

    if (error) {
      console.error("Backup failed:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log(`Backup completed successfully: ${outputDir}`);
  }
);
