import crypto from "node:crypto";
import { Resend } from "resend";
import "./env-service.js";
import { getEnvDiagnostics } from "./env-service.js";
import { readJsonFile, writeJsonFile } from "./storage-service.js";

const NOTIFICATIONS_FILE = "admin-notifications.json";

let cachedResendClient = null;
let cachedApiKey = null;

function getNotifications() {
  return readJsonFile(NOTIFICATIONS_FILE, []);
}

function saveNotifications(items) {
  writeJsonFile(NOTIFICATIONS_FILE, items);
}

function getMailConfig() {
  return {
    provider: "resend",
    adminEmail: process.env.ADMIN_EMAIL || "giteshpandya@gmail.com",
    emailFrom: process.env.EMAIL_FROM || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
  };
}

function getMailProviderStatus() {
  const config = getMailConfig();
  const diagnostics = getEnvDiagnostics();
  const resendConfigured = Boolean(
    config.emailFrom && config.resendApiKey,
  );

  return {
    provider: config.provider,
    admin_email: config.adminEmail,
    resend_configured: resendConfigured,
    diagnostics,
  };
}

function getResendClient() {
  const config = getMailConfig();
  const providerStatus = getMailProviderStatus();

  if (!providerStatus.resend_configured) {
    return {
      resend: null,
      providerStatus,
      reason: "email_not_configured",
      error_message:
        "Email sending is not configured. Add RESEND_API_KEY and EMAIL_FROM before sending email.",
    };
  }

  if (cachedResendClient && cachedApiKey === config.resendApiKey) {
    return {
      resend: cachedResendClient,
      providerStatus,
      reason: "cached",
    };
  }

  logEmailAttempt("client_create_start", {
    provider: providerStatus.provider,
    emailFromConfigured: Boolean(config.emailFrom),
    apiKeyConfigured: Boolean(config.resendApiKey),
  });

  try {
    const resend = new Resend(config.resendApiKey);

    cachedResendClient = resend;
    cachedApiKey = config.resendApiKey;

    logEmailAttempt("client_create_success", {
      provider: providerStatus.provider,
    });

    return {
      resend,
      providerStatus,
      reason: "ready",
    };
  } catch (error) {
    logEmailFailure("client_create_failure", {
      provider: providerStatus.provider,
      reason: error.code || error.name || "resend_client_error",
      message: error.message,
      stack: error.stack,
    });

    return {
      resend: null,
      providerStatus,
      reason: "resend_client_error",
      error_message: error.message,
    };
  }
}

function logEmailAttempt(stage, details) {
  console.info(`[email] ${stage} ${JSON.stringify(details)}`);
}

function logEmailFailure(stage, details) {
  console.error(`[email] ${stage} ${JSON.stringify(details)}`);
}

async function trySendEmail({ to, subject, text, html = "" }) {
  const config = getMailConfig();
  const providerStatus = getMailProviderStatus();
  const safeContext = {
    provider: providerStatus.provider,
    to,
    subject,
  };

  logEmailAttempt("attempt", safeContext);

  if (!to) {
    logEmailFailure("blocked", {
      ...safeContext,
      reason: "missing_recipient",
    });

    return {
      attempted: false,
      delivered: false,
      provider: providerStatus.provider,
      reason: "missing_recipient",
      error_message: "No recipient email address was provided.",
    };
  }

  try {
    const { resend, reason, error_message } = getResendClient();

    if (!resend) {
      logEmailFailure("blocked", {
        ...safeContext,
        reason,
        error_message,
      });

      return {
        attempted: true,
        delivered: false,
        provider: providerStatus.provider,
        reason,
        error_message,
      };
    }

    logEmailAttempt("send_start", safeContext);

    const { data, error } = await resend.emails.send({
      from: config.emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      ...(html ? { html } : {}),
    });

    if (error) {
      logEmailFailure("send_failure", {
        ...safeContext,
        reason: error.name || "resend_error",
        message: error.message,
      });

      return {
        attempted: true,
        delivered: false,
        provider: providerStatus.provider,
        reason: error.name || "resend_error",
        error_message: error.message,
      };
    }

    logEmailAttempt("send_success", {
      ...safeContext,
      messageId: data?.id ?? null,
      transport: reason,
    });

    return {
      attempted: true,
      delivered: true,
      provider: providerStatus.provider,
      reason: "sent",
      message_id: data?.id ?? null,
    };
  } catch (error) {
    logEmailFailure("send_failure", {
      ...safeContext,
      reason: error.code || error.name || "send_failed",
      message: error.message,
      stack: error.stack,
    });

    return {
      attempted: true,
      delivered: false,
      provider: providerStatus.provider,
      reason: error.code || error.name || "send_failed",
      error_message: error.message,
    };
  }
}

function createNotificationRecord({
  audience,
  type,
  title,
  body,
  userId = null,
  userEmail = null,
  requiresAdminAction = false,
  emailResult = null,
}) {
  const current = getNotifications();
  const notification = {
    id: crypto.randomUUID(),
    audience,
    type,
    title,
    body,
    user_id: userId,
    user_email: userEmail,
    requires_admin_action: requiresAdminAction,
    email_result: emailResult,
    created_at: new Date().toISOString(),
  };

  current.unshift(notification);
  saveNotifications(current);
  return notification;
}

function toHtmlParagraphs(lines) {
  return lines.map((line) => `<p>${line}</p>`).join("");
}

export async function notifyAdminOfSignup(user) {
  const config = getMailConfig();
  const subject = `New account signup: ${user.full_name}`;
  const lines = [
    "A new user signed up.",
    `Name: ${user.full_name}`,
    `Email: ${user.email}`,
    `Created: ${user.created_at}`,
    `Email verified: ${user.email_verified ? "yes" : "no"}`,
  ];
  const text = lines.join("\n");

  const emailResult = await trySendEmail({
    to: config.adminEmail,
    subject,
    text,
    html: toHtmlParagraphs(lines),
  });

  return createNotificationRecord({
    audience: "admin",
    type: "signup",
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    requiresAdminAction: false,
    emailResult,
  });
}

export async function notifyAdminOfEmailVerification(user) {
  const config = getMailConfig();
  const subject = `Email verified: ${user.full_name}`;
  const lines = [
    "A user completed email verification.",
    `Name: ${user.full_name}`,
    `Email: ${user.email}`,
    `Verified at: ${user.email_verified_at}`,
  ];
  const text = lines.join("\n");

  const emailResult = await trySendEmail({
    to: config.adminEmail,
    subject,
    text,
    html: toHtmlParagraphs(lines),
  });

  return createNotificationRecord({
    audience: "admin",
    type: "email_verified",
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    requiresAdminAction: false,
    emailResult,
  });
}

export async function notifyAdminOfUpgradeRequest(user, upgradeRequest) {
  const config = getMailConfig();
  const providerStatus = getMailProviderStatus();
  const subject = `Upgrade request pending: ${user.full_name}`;
  const lines = [
    "A user requested an upgrade.",
    `Name: ${user.full_name}`,
    `Email: ${user.email}`,
    `Requested: ${upgradeRequest.requested_at}`,
    `Request id: ${upgradeRequest.id}`,
  ];
  const text = lines.join("\n");

  logEmailAttempt("upgrade_admin_notification_prepare", {
    provider: providerStatus.provider,
    adminEmailConfigured: providerStatus.diagnostics.has_admin_email,
    emailFromConfigured: providerStatus.diagnostics.has_email_from,
    resendConfigured: providerStatus.diagnostics.has_resend_api_key,
    requestId: upgradeRequest.id,
    userId: user.id,
  });

  const emailResult = await trySendEmail({
    to: config.adminEmail,
    subject,
    text,
    html: toHtmlParagraphs(lines),
  });

  return createNotificationRecord({
    audience: "admin",
    type: "upgrade_pending",
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    requiresAdminAction: true,
    emailResult,
  });
}

export async function notifyUserVerificationEmail(user, verificationUrl) {
  const subject = "Verify your email";
  const lines = [
    "Please verify your email to activate your account.",
    verificationUrl,
  ];
  const text = lines.join("\n\n");

  const emailResult = await trySendEmail({
    to: user.email,
    subject,
    text,
    html: toHtmlParagraphs([
      "Please verify your email to activate your account.",
      `<a href="${verificationUrl}">${verificationUrl}</a>`,
    ]),
  });

  return createNotificationRecord({
    audience: "user",
    type: "verify_email",
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    emailResult,
  });
}

export async function notifyUserVerificationSuccess(user) {
  const subject = "Email verified successfully";
  const text =
    "Your email has been verified successfully. You can now log in and request an upgrade if you want additional sessions.";

  const emailResult = await trySendEmail({
    to: user.email,
    subject,
    text,
    html: toHtmlParagraphs([text]),
  });

  return createNotificationRecord({
    audience: "user",
    type: "email_verified_success",
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    emailResult,
  });
}

export async function notifyUserUpgradeUpdate(user, status) {
  const approved = status === "approved";
  const subject = approved
    ? "Your upgrade has been approved"
    : "Your upgrade request was rejected";
  const text = approved
    ? "Your upgrade has been approved. You now have unlimited access."
    : "Your upgrade request was rejected. You can continue using your daily free session.";

  const emailResult = await trySendEmail({
    to: user.email,
    subject,
    text,
    html: toHtmlParagraphs([text]),
  });

  return createNotificationRecord({
    audience: "user",
    type: `upgrade_${status}`,
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    emailResult,
  });
}

export function listAdminNotifications() {
  return getNotifications().filter((item) => item.audience === "admin");
}

export async function notifyUserPasswordResetEmail(user, resetUrl) {
  const subject = "Reset your password";
  const lines = [
    "We received a request to reset your password.",
    "Use the link below to choose a new password. This link expires in 1 hour.",
    resetUrl,
  ];
  const text = lines.join("\n\n");

  const emailResult = await trySendEmail({
    to: user.email,
    subject,
    text,
    html: toHtmlParagraphs([
      "We received a request to reset your password.",
      "Use the link below to choose a new password. This link expires in 1 hour.",
      `<a href="${resetUrl}">${resetUrl}</a>`,
    ]),
  });

  return createNotificationRecord({
    audience: "user",
    type: "password_reset",
    title: subject,
    body: text,
    userId: user.id,
    userEmail: user.email,
    emailResult,
  });
}

export { getMailProviderStatus };
