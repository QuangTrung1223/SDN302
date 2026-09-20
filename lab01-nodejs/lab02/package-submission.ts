import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STUDENT_CODE = "DS190284";
const FULL_NAME = "NguyenLeQuangTrung";
const ZIP_FILE_NAME = `${STUDENT_CODE}_${FULL_NAME}_Lab02.zip`;

const distDir = path.join(__dirname, "dist");
const stagingLab02 = path.join(distDir, "lab02");
const zipOutputPath = path.join(__dirname, ZIP_FILE_NAME);
const lab02NodejsDir = path.resolve(__dirname, "..", "..", "lab02-nodejs");

console.log("====================================================");
console.log("Packaging Lab 02 (TypeScript) for LMS Submission");
console.log(`Student: ${FULL_NAME} (${STUDENT_CODE})`);
console.log("====================================================");

// 1. Clean staging directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingLab02, { recursive: true });

// 2. List of files and folders to include
const filesToCopy = [
  "package.json",
  "tsconfig.json",
  "types.ts",
  "server.ts",
  "fileHelpers.ts",
  "testCallbacks.ts",
  "verifyServer.ts",
  "books.json",
  "BookNest_Lab02.postman_collection.json",
  "LAB02_REPORT.md"
];

const dirsToCopy = [
  "public"
];

// Copy files
for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(stagingLab02, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Copied ${file}`);
  }
}

// Copy directories
for (const dir of dirsToCopy) {
  const src = path.join(__dirname, dir);
  const dest = path.join(stagingLab02, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`  ✓ Copied directory ${dir}/`);
  }
}

// 3. Create Zip file containing the 'lab02' directory
if (fs.existsSync(zipOutputPath)) {
  fs.unlinkSync(zipOutputPath);
}

console.log("\nCompressing archive via PowerShell Compress-Archive...");
const psCommand = `powershell -Command "Compress-Archive -Path '${stagingLab02}' -DestinationPath '${zipOutputPath}' -Force"`;
execSync(psCommand, { stdio: "inherit" });

console.log(`\n✅ Successfully generated LMS submission file:`);
console.log(`   ${zipOutputPath}`);

// 4. Also synchronize copy to D:\Semester7\SDN302\lab02-nodejs as requested
try {
  console.log(`\nSynchronizing source files to ${lab02NodejsDir}...`);
  if (!fs.existsSync(lab02NodejsDir)) {
    fs.mkdirSync(lab02NodejsDir, { recursive: true });
  }
  fs.cpSync(stagingLab02, lab02NodejsDir, { recursive: true });
  console.log(`✅ Synchronized clean project files to: ${lab02NodejsDir}`);
} catch (syncErr) {
  console.warn("Notice: Sync to parent repo folder skipped or permission restricted:", (syncErr as Error).message);
}

// Clean temporary staging dist
fs.rmSync(distDir, { recursive: true, force: true });
console.log("====================================================");
console.log("Done! You are ready to submit to LMS.");
console.log("====================================================");
