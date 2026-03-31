import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATHS = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
];

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const contents = fs.readFileSync(filePath, "utf-8");
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripQuotes(rawValue);
  }

  return true;
}

let loadedPath = null;

for (const candidatePath of ENV_PATHS) {
  if (loadEnvFile(candidatePath)) {
    loadedPath = candidatePath;
    break;
  }
}

export function getEnvDiagnostics() {
  return {
    loaded_path: loadedPath,
    has_admin_email: Boolean(process.env.ADMIN_EMAIL),
    has_email_from: Boolean(process.env.EMAIL_FROM),
    has_resend_api_key: Boolean(process.env.RESEND_API_KEY),
  };
}
