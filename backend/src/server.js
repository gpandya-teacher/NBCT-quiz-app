import "./env-service.js";
import express from "express";
import cors from "cors";
import {
  authenticateUser,
  createAuthToken,
  createPasswordResetRequest,
  createUser,
  getTokenFromRequest,
  getUserById,
  listUsers,
  resetPasswordWithToken,
  revokeAuthToken,
  updateAccountStatus,
  verifyUserEmail,
} from "./auth-service.js";
import { getUpgradePlanConfig } from "./billing-service.js";
import {
  consumeLaunchAccess,
  ensureVerifiedUser,
  getRequestIdentity,
  getUsageSnapshot,
  migrateAnonymousUsageToUser,
} from "./access-service.js";
import {
  createQuizSession,
  gradeQuizSession,
  getQuestionBankStats,
} from "./mcq-service.js";
import {
  getMailProviderStatus,
  listAdminNotifications,
  notifyAdminOfEmailVerification,
  notifyAdminOfSignup,
  notifyAdminOfUpgradeRequest,
  notifyUserPasswordResetEmail,
  notifyUserUpgradeUpdate,
  notifyUserVerificationEmail,
  notifyUserVerificationSuccess,
} from "./notification-service.js";
import {
  createUpgradeRequest,
  listUpgradeRequests,
  updateUpgradeRequest,
} from "./upgrade-service.js";
import {
  consumeVerificationToken,
  createVerificationToken,
} from "./verification-service.js";
import {
  autosaveWrittenPrompt,
  createWrittenPromptSession,
  getWrittenPromptStats,
  submitWrittenPrompt,
} from "./written-service.js";

const app = express();
const PORT = process.env.PORT || 3001;
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:5173";

app.use(cors());
app.use(express.json());

function requireAdmin(request) {
  const identity = getRequestIdentity(request);

  if (!identity.user || identity.user.role !== "admin") {
    return null;
  }

  return identity.user;
}

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    mcq: getQuestionBankStats(),
    written: getWrittenPromptStats(),
  });
});

app.get("/api/auth/me", (request, response) => {
  response.json(getUsageSnapshot(request));
});

app.post("/api/auth/signup", async (request, response) => {
  const { fullName, email, password } = request.body ?? {};

  if (!fullName || !email || !password || password.length < 8) {
    return response.status(400).json({
      message: "Full name, email, and a password of at least 8 characters are required.",
    });
  }

  try {
    const user = createUser({ fullName, email, password });
    migrateAnonymousUsageToUser(request.headers["x-anon-id"], user.id);
    const verificationToken = createVerificationToken(user.id);
    const verificationUrl = `${APP_BASE_URL}/?verify=${verificationToken}`;
    const adminNotification = await notifyAdminOfSignup(user);
    const verificationNotification = await notifyUserVerificationEmail(
      user,
      verificationUrl,
    );

    const verificationDelivered = Boolean(
      verificationNotification.email_result?.delivered,
    );

    return response.status(201).json({
      message: verificationDelivered
        ? "Account created. Verify your email to activate your account."
        : "Account created, but the verification email could not be sent. Check the server email configuration and try resending the verification email.",
      user,
      verification_required: !user.email_verified,
      email_delivery: {
        admin: adminNotification.email_result,
        verification: verificationNotification.email_result,
      },
      verification_token_preview:
        process.env.NODE_ENV === "production" ? null : verificationToken,
    });
  } catch (error) {
    return response.status(400).json({
      message: error.message,
    });
  }
});

app.post("/api/auth/verify-email", async (request, response) => {
  const { token } = request.body ?? {};

  if (!token) {
    return response.status(400).json({
      message: "Verification token is required.",
    });
  }

  const verification = consumeVerificationToken(token);

  if (!verification) {
    return response.status(400).json({
      message: "Verification link is invalid or expired.",
    });
  }

  const user = verifyUserEmail(verification.user_id);
  const adminNotification = await notifyAdminOfEmailVerification(user);
  const userNotification = await notifyUserVerificationSuccess(user);

  return response.json({
    message: "Email verified successfully.",
    user,
    email_delivery: {
      admin: adminNotification.email_result,
      confirmation: userNotification.email_result,
    },
  });
});

app.post("/api/auth/resend-verification", async (request, response) => {
  try {
    const { email } = request.body ?? {};

    if (!email) {
      return response.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = listUsers().find((item) => item.email === normalizedEmail);

    if (!user) {
      return response.status(404).json({
        message: "No account was found for that email address.",
      });
    }

    if (user.email_verified) {
      return response.status(400).json({
        message: "This email address is already verified.",
        user,
      });
    }

    const verificationToken = createVerificationToken(user.id);
    const verificationUrl = `${APP_BASE_URL}/?verify=${verificationToken}`;
    const verificationNotification = await notifyUserVerificationEmail(
      user,
      verificationUrl,
    );

    return response.json({
      message: verificationNotification.email_result?.delivered
        ? "Verification email sent."
        : "Verification email could not be sent. Check the server logs and email configuration.",
      user,
      email_delivery: verificationNotification.email_result,
      verification_token_preview:
        process.env.NODE_ENV === "production" ? null : verificationToken,
    });
  } catch (error) {
    console.error("[auth] resend verification failed", {
      message: error.message,
      stack: error.stack,
    });

    return response.status(500).json({
      message: "Verification email could not be generated.",
      reason: "resend_verification_failed",
      error: error.message,
    });
  }
});

app.post("/api/auth/forgot-password", async (request, response) => {
  const { email } = request.body ?? {};

  if (!email) {
    return response.status(400).json({
      message: "Email is required.",
    });
  }

  const resetRequest = createPasswordResetRequest(email);

  if (resetRequest) {
    const resetUrl = `${APP_BASE_URL}/reset-password?token=${resetRequest.rawToken}`;
    const emailNotification = await notifyUserPasswordResetEmail(
      resetRequest.user,
      resetUrl,
    );

    if (process.env.NODE_ENV !== "production") {
      console.info("[auth] password reset link", {
        email: resetRequest.user.email,
        resetUrl,
        mode: "development",
      });
    }

    if (!emailNotification.email_result?.delivered) {
      console.info("[auth] password reset link", {
        email: resetRequest.user.email,
        resetUrl,
        deliveryReason: emailNotification.email_result?.reason ?? "not_sent",
      });
    }
  }

  return response.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });
});

app.post("/api/auth/reset-password", (request, response) => {
  const { token, newPassword } = request.body ?? {};

  if (!token || !newPassword) {
    return response.status(400).json({
      message: "Token and new password are required.",
    });
  }

  try {
    resetPasswordWithToken({ token, newPassword });
    return response.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    return response.status(400).json({
      message: error.message,
    });
  }
});

app.post("/api/auth/login", (request, response) => {
  const { email, password } = request.body ?? {};

  if (!email || !password) {
    return response.status(400).json({
      message: "Email and password are required.",
    });
  }

  try {
    const user = authenticateUser({ email, password });

    if (!user.email_verified) {
      return response.status(403).json({
        message: "Verify your email to activate your account.",
        reason: "email_verification_required",
        user,
      });
    }

    if (user.account_status === "suspended") {
      return response.status(403).json({
        message: "Your account is suspended.",
        reason: "account_suspended",
        user,
      });
    }

    migrateAnonymousUsageToUser(request.headers["x-anon-id"], user.id);
    const token = createAuthToken(user.id);
    return response.json({
      message: "Login successful.",
      user: getRequestIdentity({
        headers: {
          authorization: `Bearer ${token}`,
          "x-anon-id": request.headers["x-anon-id"] ?? "",
        },
      }).user,
      token,
    });
  } catch (error) {
    return response.status(401).json({
      message: error.message,
    });
  }
});

app.post("/api/auth/logout", (request, response) => {
  const token = getTokenFromRequest(request);

  if (token) {
    revokeAuthToken(token);
  }

  return response.status(204).send();
});

app.get("/api/billing/config", (_request, response) => {
  response.json(getUpgradePlanConfig());
});

app.post("/api/billing/upgrade-request", async (request, response) => {
  const access = ensureVerifiedUser(request);

  if (!access.allowed) {
    return response.status(access.status).json({
      message: access.message,
      detail: access.detail,
      reason: access.reason,
      user: access.user ?? null,
    });
  }

  const requestRecord = createUpgradeRequest(access.user);
  const providerStatus = getMailProviderStatus();
  console.info("[upgrade-request] saved", {
    userId: access.user.id,
    userEmail: access.user.email,
    requestId: requestRecord.id,
    adminEmailConfigured: providerStatus.diagnostics.has_admin_email,
    emailFromConfigured: providerStatus.diagnostics.has_email_from,
    resendApiKeyConfigured: providerStatus.diagnostics.has_resend_api_key,
    resendConfigured: providerStatus.resend_configured,
  });
  const adminNotification = await notifyAdminOfUpgradeRequest(
    access.user,
    requestRecord,
  );

  console.info("[upgrade-request] admin notification result", {
    requestId: requestRecord.id,
    delivered: Boolean(adminNotification.email_result?.delivered),
    reason: adminNotification.email_result?.reason ?? "unknown",
  });

  return response.status(201).json({
    message: "Your upgrade request is pending admin approval.",
    request: requestRecord,
    user: getUserById(access.user.id),
    email_delivery: adminNotification.email_result,
  });
});

app.get("/api/admin/users", (request, response) => {
  const adminUser = requireAdmin(request);

  if (!adminUser) {
    return response.status(403).json({
      message: "Admin access required.",
    });
  }

  return response.json({
    users: listUsers(),
    notifications: listAdminNotifications(),
    upgrade_requests: listUpgradeRequests(),
    email_provider: getMailProviderStatus(),
  });
});

app.post("/api/admin/users/:userId/status", (request, response) => {
  const adminUser = requireAdmin(request);

  if (!adminUser) {
    return response.status(403).json({
      message: "Admin access required.",
    });
  }

  const { status } = request.body ?? {};

  if (!["active", "suspended"].includes(status)) {
    return response.status(400).json({
      message: "Valid account status is required.",
    });
  }

  const updatedUser = updateAccountStatus({
    targetUserId: request.params.userId,
    status,
  });

  if (!updatedUser) {
    return response.status(404).json({
      message: "User not found.",
    });
  }

  return response.json({
    user: updatedUser,
  });
});

app.post("/api/admin/upgrades/:requestId", async (request, response) => {
  const adminUser = requireAdmin(request);

  if (!adminUser) {
    return response.status(403).json({
      message: "Admin access required.",
    });
  }

  const { status, notes } = request.body ?? {};

  if (!["approved", "rejected"].includes(status)) {
    return response.status(400).json({
      message: "Valid upgrade status is required.",
    });
  }

  const updatedRequest = updateUpgradeRequest({
    requestId: request.params.requestId,
    status,
    actedBy: adminUser.id,
    notes,
  });

  if (!updatedRequest) {
    return response.status(404).json({
      message: "Upgrade request not found.",
    });
  }

  const updatedUser = getUserById(updatedRequest.user_id);
  const notification = await notifyUserUpgradeUpdate(updatedUser, status);

  return response.json({
    request: updatedRequest,
    user: updatedUser,
    email_delivery: notification.email_result,
  });
});

app.get("/api/admin/email/debug", (request, response) => {
  const adminUser = requireAdmin(request);

  if (!adminUser) {
    return response.status(403).json({
      message: "Admin access required.",
    });
  }

  return response.json({
    provider: getMailProviderStatus(),
  });
});

app.get("/api/quiz", (request, response) => {
  const access = consumeLaunchAccess(request);

  if (!access.allowed) {
    return response.status(access.status).json({
      message: access.message,
      detail: access.detail,
      reason: access.reason,
      usage: access.usage,
      create_account_prompt: "Create an account to continue.",
      upgrade_prompt: "Upgrade to unlimited access for $1/day.",
      verify_email_prompt: "Verify your email to activate your account.",
    });
  }

  const { limit } = request.query;
  const quiz = createQuizSession(limit);
  response.json({
    ...quiz,
    access: {
      usage: access.usage,
      has_unlimited_access: Boolean(access.unlimited),
    },
  });
});

app.post("/api/quiz/submit", (request, response) => {
  const { quizId, answers } = request.body ?? {};

  if (!quizId || !Array.isArray(answers)) {
    return response.status(400).json({
      message: "quizId and answers are required.",
    });
  }

  const result = gradeQuizSession(quizId, answers);

  if (!result) {
    return response.status(404).json({
      message: "Quiz session not found or already submitted.",
    });
  }

  return response.json(result);
});

app.get("/api/written-prompts/session", (request, response) => {
  const access = consumeLaunchAccess(request);

  if (!access.allowed) {
    return response.status(access.status).json({
      message: access.message,
      detail: access.detail,
      reason: access.reason,
      usage: access.usage,
      create_account_prompt: "Create an account to continue.",
      upgrade_prompt: "Upgrade to unlimited access for $1/day.",
      verify_email_prompt: "Verify your email to activate your account.",
    });
  }

  const session = createWrittenPromptSession();
  response.json({
    ...session,
    access: {
      usage: access.usage,
      has_unlimited_access: Boolean(access.unlimited),
    },
  });
});

app.post("/api/written-prompts/autosave", (request, response) => {
  const { sessionId, responseText } = request.body ?? {};

  if (!sessionId) {
    return response.status(400).json({
      message: "sessionId is required.",
    });
  }

  const saved = autosaveWrittenPrompt(sessionId, responseText ?? "");

  if (!saved) {
    return response.status(404).json({
      message: "Written prompt session not found.",
    });
  }

  return response.json(saved);
});

app.post("/api/written-prompts/submit", (request, response) => {
  const { sessionId, responseText } = request.body ?? {};

  if (!sessionId) {
    return response.status(400).json({
      message: "sessionId is required.",
    });
  }

  const result = submitWrittenPrompt(sessionId, responseText ?? "");

  if (!result) {
    return response.status(404).json({
      message: "Written prompt session not found or already submitted.",
    });
  }

  return response.json(result);
});

app.listen(PORT, () => {
  console.log(`NBCT quiz API listening on port ${PORT}`);
});
