import crypto from "node:crypto";
import nodemailer from "nodemailer";
import "./env-service.js";
import { getEnvDiagnostics } from "./env-service.js";
import { readJsonFile, writeJsonFile } from "./storage-service.js";

const NOTIFICATIONS_FILE = "admin-notifications.json";

let cachedTransporter = null;
let cachedTransporterKey = null;

function getNotifications() {
  return readJsonFile(NOTIFICATIONS_FILE, []);
}

function saveNotifications(items) {
  writeJsonFile(NOTIFICATIONS_FILE, items);
}

function getMailConfig() {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";

  return {
    provider: "smtp",
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

function getSmtpConfigKey(config) {
  return [
    config.smtpHost,
    config.smtpPort,
    config.smtpUser,
    config.emailFrom,
  ].join("|");
}

function getMailProviderStatus() {
  const config = getMailConfig();
  const diagnostics = getEnvDiagnostics();
  const smtpConfigured = Boolean(
    config.emailFrom &&
      config.smtpHost &&
      config.smtpPort &&
      config.smtpUser &&
      config.smtpPass,
  );

  return {
    provider: config.provider,
    admin_email: config.adminEmail,
    smtp_configured: smtpConfigured,
    auth_source: config.authSource,
    diagnostics,
  };
}

async function getTransporter() {
  const config = getMailConfig();
  const providerStatus = getMailProviderStatus();

  if (!providerStatus.smtp_configured) {
    return {
      transporter: null,
      providerStatus,
      reason: "email_not_configured",
    };
  }

  const nextKey = getSmtpConfigKey(config);

  if (cachedTransporter && cachedTransporterKey === nextKey) {
    return {
      transporter: cachedTransporter,
      providerStatus,
      reason: "cached",
    };
  }

  logEmailAttempt("transporter_create_start", {
    provider: providerStatus.provider,
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: Number(config.smtpPort) === 465,
  });

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort),
      secure: Number(config.smtpPort) === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    logEmailAttempt("transporter_verify_start", {
      provider: providerStatus.provider,
      host: config.smtpHost,
      port: Number(config.smtpPort),
    });

    await transporter.verify();

    logEmailAttempt("transporter_verify_success", {
      provider: providerStatus.provider,
      host: config.smtpHost,
      port: Number(config.smtpPort),
    });

    cachedTransporter = transporter;
    cachedTransporterKey = nextKey;

    return {
      transporter,
      providerStatus,
      reason: "verified",
    };
  } catch (error) {
    logEmailFailure("transporter_verify_failure", {
      provider: providerStatus.provider,
      host: config.smtpHost,
      port: Number(config.smtpPort),
      reason: error.code || error.name || "smtp_error",
      message: error.message,
      stack: error.stack,
    });

    return {
      transporter: null,
      providerStatus,
      reason: "smtp_error",
      error_message: error.message,
    };
  }
}

function logEmailAttempt(stage, details) {
  console.info(
    `[email] ${stage} ${JSON.stringify(details)}`,
  );
}

function logEmailFailure(stage, details) {
  console.error(
    `[email] ${stage} ${JSON.stringify(details)}`,
  );
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
    const { transporter, reason, error_message } = await getTransporter();

    if (!transporter) {
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
        error_message:
          error_message ||
          (reason === "email_not_configured"
            ? "Email sending is not configured. Add SMTP environment variables before sending email."
            : "SMTP transport is unavailable."),
      };
    }

    logEmailAttempt("send_start", safeContext);

    const result = await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    });

    logEmailAttempt("send_success", {
      ...safeContext,
      messageId: result.messageId,
      transport: reason,
    });

    return {
      attempted: true,
      delivered: true,
      provider: providerStatus.provider,
      reason: "sent",
      message_id: result.messageId,
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
    smtpHostConfigured: providerStatus.diagnostics.has_smtp_host,
    smtpPortConfigured: providerStatus.diagnostics.has_smtp_port,
    smtpUserConfigured:
      providerStatus.diagnostics.has_smtp_user || providerStatus.diagnostics.has_email_user,
    smtpPassConfigured:
      providerStatus.diagnostics.has_smtp_pass || providerStatus.diagnostics.has_email_pass,
    authSource: providerStatus.auth_source,
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
