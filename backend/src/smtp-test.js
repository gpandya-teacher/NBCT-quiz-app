import "./env-service.js";
import { Resend } from "resend";
import { getEnvDiagnostics } from "./env-service.js";

function getMailConfig() {
  return {
    adminEmail: process.env.ADMIN_EMAIL || "giteshpandya@gmail.com",
    emailFrom: process.env.EMAIL_FROM || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
  };
}

async function main() {
  const config = getMailConfig();
  const diagnostics = getEnvDiagnostics();

  console.info("[email-test] runtime config", {
    provider: "resend",
    adminEmailConfigured: Boolean(config.adminEmail),
    emailFromConfigured: Boolean(config.emailFrom),
    resendApiKeyConfigured: Boolean(config.resendApiKey),
    envLoadedPath: diagnostics.loaded_path,
  });

  if (!config.resendApiKey || !config.emailFrom) {
    console.error("[email-test] blocked", {
      reason: "email_not_configured",
      message: "Set RESEND_API_KEY and EMAIL_FROM before testing email delivery.",
    });
    process.exitCode = 1;
    return;
  }

  try {
    console.info("[email-test] client create start", {
      provider: "resend",
    });

    const resend = new Resend(config.resendApiKey);

    console.info("[email-test] send start", {
      provider: "resend",
      to: config.adminEmail,
      from: config.emailFrom,
    });

    const { data, error } = await resend.emails.send({
      from: config.emailFrom,
      to: [config.adminEmail],
      subject: "NBCT Resend test",
      text: "This is a Resend test email from the NBCT backend.",
      html: "<p>This is a Resend test email from the NBCT backend.</p>",
    });

    if (error) {
      console.error("[email-test] send failure", {
        provider: "resend",
        reason: error.name || "resend_error",
        message: error.message,
      });
      process.exitCode = 1;
      return;
    }

    console.info("[email-test] send success", {
      provider: "resend",
      messageId: data?.id ?? null,
    });
  } catch (error) {
    console.error("[email-test] send failure", {
      provider: "resend",
      reason: error.code || error.name || "send_failed",
      message: error.message,
      stack: error.stack,
    });
    process.exitCode = 1;
  }
}

main();
