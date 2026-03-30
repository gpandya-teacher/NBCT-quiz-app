import dns from "node:dns/promises";
import nodemailer from "nodemailer";
import "./env-service.js";
import { getEnvDiagnostics } from "./env-service.js";

function getMailConfig() {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";

  return {
    adminEmail: process.env.ADMIN_EMAIL || "giteshpandya@gmail.com",
    emailFrom: process.env.EMAIL_FROM || "",
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: process.env.SMTP_PORT || "",
    smtpUser,
    smtpPass,
    authSource: process.env.SMTP_USER
      ? "SMTP_USER/SMTP_PASS"
      : process.env.EMAIL_USER
        ? "EMAIL_USER/EMAIL_PASS"
        : "missing",
  };
}

async function main() {
  const config = getMailConfig();
  const diagnostics = getEnvDiagnostics();

  console.info("[smtp-test] runtime config", {
    smtpHost: config.smtpHost,
    smtpPort: Number(config.smtpPort),
    adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
    emailFromConfigured: Boolean(process.env.EMAIL_FROM),
    smtpHostConfigured: Boolean(process.env.SMTP_HOST),
    smtpPortConfigured: Boolean(process.env.SMTP_PORT),
    smtpUserConfigured: Boolean(process.env.SMTP_USER || process.env.EMAIL_USER),
    smtpPassConfigured: Boolean(process.env.SMTP_PASS || process.env.EMAIL_PASS),
    authSource: config.authSource,
    envLoadedPath: diagnostics.loaded_path,
  });

  try {
    const lookup = await dns.lookup(config.smtpHost, { all: true });
    console.info("[smtp-test] dns.lookup success", {
      smtpHost: config.smtpHost,
      addresses: lookup.map((item) => ({
        address: item.address,
        family: item.family,
      })),
    });
  } catch (error) {
    console.error("[smtp-test] dns.lookup failure", {
      smtpHost: config.smtpHost,
      code: error.code || error.name || "dns_lookup_failed",
      message: error.message,
      stack: error.stack,
    });
  }

  try {
    console.info("[smtp-test] transporter create start", {
      smtpHost: config.smtpHost,
      smtpPort: Number(config.smtpPort),
      secure: Number(config.smtpPort) === 465,
    });

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort),
      secure: Number(config.smtpPort) === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    console.info("[smtp-test] transporter verify start", {
      smtpHost: config.smtpHost,
      smtpPort: Number(config.smtpPort),
    });

    await transporter.verify();

    console.info("[smtp-test] transporter verify success", {
      smtpHost: config.smtpHost,
      smtpPort: Number(config.smtpPort),
    });
  } catch (error) {
    console.error("[smtp-test] transporter verify failure", {
      smtpHost: config.smtpHost,
      smtpPort: Number(config.smtpPort),
      code: error.code || error.name || "smtp_verify_failed",
      message: error.message,
      stack: error.stack,
    });
  }
}

main();
