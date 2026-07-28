import { access, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticSource = path.join(root, ".next", "static");
const staticDestination = path.join(standaloneDir, ".next", "static");
const publicSource = path.join(root, "public");
const publicDestination = path.join(standaloneDir, "public");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyRequiredDirectory(source, destination, label) {
  if (!(await exists(source))) {
    throw new Error(`Missing ${label} directory: ${source}`);
  }

  await rm(destination, { force: true, recursive: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
  console.log(`Copied ${label} to ${path.relative(root, destination)}`);
}

async function copyOptionalDirectory(source, destination, label) {
  if (!(await exists(source))) {
    return;
  }

  await rm(destination, { force: true, recursive: true });
  await cp(source, destination, { recursive: true });
  console.log(`Copied ${label} to ${path.relative(root, destination)}`);
}

if (!(await exists(standaloneDir))) {
  throw new Error("Missing .next/standalone. Run next build before preparing standalone assets.");
}

await copyRequiredDirectory(staticSource, staticDestination, "Next static assets");
await copyOptionalDirectory(publicSource, publicDestination, "public assets");
