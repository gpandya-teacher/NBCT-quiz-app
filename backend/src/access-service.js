import "./env-service.js";
import { getTokenFromRequest, getUserByToken, updateUser } from "./auth-service.js";
import { readJsonFile, writeJsonFile } from "./storage-service.js";

const ANON_USAGE_FILE = "anon-usage.json";
const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Los_Angeles";
const DAILY_FREE_LIMIT = 1;
const AUTH_BYPASS_ENABLED =
  process.env.BYPASS_AUTH === "true" || process.env.NODE_ENV === "production";

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getAnonymousUsage() {
  return readJsonFile(ANON_USAGE_FILE, {});
}

function saveAnonymousUsage(usage) {
  writeJsonFile(ANON_USAGE_FILE, usage);
}

function hasApprovedUpgrade(user) {
  return user?.upgrade_status === "approved";
}

function isSuspended(user) {
  return user?.account_status === "suspended";
}

export function getRequestIdentity(request) {
  const token = getTokenFromRequest(request);
  const user = token ? getUserByToken(token) : null;
  const anonymousId = request.headers["x-anon-id"] ?? null;

  return {
    user,
    anonymousId,
  };
}

function describeUsageState(subjectUsage) {
  const todayKey = getTodayKey();
  const isToday = subjectUsage.last_free_usage_date === todayKey;
  const countToday = isToday ? subjectUsage.free_usage_count_today : 0;
  return {
    free_usage_count_today: countToday,
    last_free_usage_date: subjectUsage.last_free_usage_date,
    daily_limit: DAILY_FREE_LIMIT,
    timezone: APP_TIMEZONE,
  };
}

function blockSuspended(user) {
  if (!isSuspended(user)) {
    return null;
  }

  return {
    allowed: false,
    status: 403,
    message: "Your account is suspended.",
    detail: "Contact the administrator for assistance.",
    reason: "account_suspended",
    user,
  };
}

function consumeAnonymousSession(anonymousId) {
  if (!anonymousId) {
    return {
      allowed: false,
      status: 401,
      message: "Create an account to continue.",
      reason: "anonymous_login_required",
    };
  }

  const todayKey = getTodayKey();
  const usage = getAnonymousUsage();
  const current = usage[anonymousId] ?? {
    free_usage_count_today: 0,
    last_free_usage_date: null,
  };
  const currentUsage = describeUsageState(current);

  if (currentUsage.free_usage_count_today >= DAILY_FREE_LIMIT) {
    return {
      allowed: false,
      status: 402,
      message: "You have already used your free session today.",
      detail:
        "Sign up or log in, verify your email, and request an upgrade for additional sessions.",
      reason: "anonymous_daily_limit_reached",
      usage: currentUsage,
    };
  }

  usage[anonymousId] = {
    free_usage_count_today: currentUsage.free_usage_count_today + 1,
    last_free_usage_date: todayKey,
  };
  saveAnonymousUsage(usage);

  return {
    allowed: true,
    usage: describeUsageState(usage[anonymousId]),
    free_tier: true,
  };
}

function consumeUserSession(user) {
  const suspendedBlock = blockSuspended(user);

  if (suspendedBlock) {
    return suspendedBlock;
  }

  if (hasApprovedUpgrade(user)) {
    return {
      allowed: true,
      unlimited: true,
      usage: describeUsageState(user),
    };
  }

  const todayKey = getTodayKey();
  const currentUsage = describeUsageState(user);

  if (currentUsage.free_usage_count_today >= DAILY_FREE_LIMIT) {
    if (!user.email_verified) {
      return {
        allowed: false,
        status: 403,
        message: "Verify your email to activate your account.",
        detail: "Email verification is required before requesting an upgrade.",
        reason: "email_verification_required",
        usage: currentUsage,
      };
    }

    return {
      allowed: false,
      status: 402,
      message: "You have already used your free session today.",
      detail:
        user.upgrade_status === "pending"
          ? "Your upgrade request is pending admin approval."
          : "Request an upgrade for additional sessions.",
      reason:
        user.upgrade_status === "pending"
          ? "upgrade_pending"
          : "upgrade_required",
      usage: currentUsage,
    };
  }

  const updatedUser = updateUser(user.id, () => ({
    free_usage_count_today: currentUsage.free_usage_count_today + 1,
    last_free_usage_date: todayKey,
  }));

  return {
    allowed: true,
    usage: describeUsageState(updatedUser),
    free_tier: true,
  };
}

// A "session" means one full prompt/practice attempt launched through the app.
export function consumeLaunchAccess(request) {
  const identity = getRequestIdentity(request);

  if (AUTH_BYPASS_ENABLED) {
    return {
      allowed: true,
      unlimited: true,
      usage: identity.user
        ? describeUsageState(identity.user)
        : describeUsageState({
            free_usage_count_today: 0,
            last_free_usage_date: null,
          }),
      user: identity.user ?? null,
    };
  }

  if (identity.user) {
    return {
      ...consumeUserSession(identity.user),
      user: identity.user,
    };
  }

  return {
    ...consumeAnonymousSession(identity.anonymousId),
    user: null,
  };
}

export function getUsageSnapshot(request) {
  const identity = getRequestIdentity(request);

  if (AUTH_BYPASS_ENABLED) {
    return {
      user: identity.user ?? null,
      usage: identity.user
        ? describeUsageState(identity.user)
        : describeUsageState({
            free_usage_count_today: 0,
            last_free_usage_date: null,
          }),
      has_unlimited_access: true,
      timezone: APP_TIMEZONE,
      auth_bypassed: true,
    };
  }

  if (identity.user) {
    return {
      user: identity.user,
      usage: describeUsageState(identity.user),
      has_unlimited_access: hasApprovedUpgrade(identity.user),
      timezone: APP_TIMEZONE,
    };
  }

  const anonymousUsage = identity.anonymousId
    ? getAnonymousUsage()[identity.anonymousId] ?? {
        free_usage_count_today: 0,
        last_free_usage_date: null,
      }
    : {
        free_usage_count_today: 0,
        last_free_usage_date: null,
      };

  return {
    user: null,
    usage: describeUsageState(anonymousUsage),
    has_unlimited_access: false,
    timezone: APP_TIMEZONE,
  };
}

export function migrateAnonymousUsageToUser(anonymousId, userId) {
  if (!anonymousId || !userId) {
    return;
  }

  const usage = getAnonymousUsage();
  const anonymousUsage = usage[anonymousId];
  const todayKey = getTodayKey();

  if (!anonymousUsage || anonymousUsage.last_free_usage_date !== todayKey) {
    return;
  }

  updateUser(userId, (current) => ({
    free_usage_count_today: Math.max(
      current.last_free_usage_date === todayKey ? current.free_usage_count_today : 0,
      anonymousUsage.free_usage_count_today,
    ),
    last_free_usage_date: todayKey,
  }));
}

export function ensureVerifiedUser(request) {
  const identity = getRequestIdentity(request);

  if (!identity.user) {
    return {
      allowed: false,
      status: 401,
      message: "Log in to continue.",
      reason: "auth_required",
    };
  }

  const suspendedBlock = blockSuspended(identity.user);

  if (suspendedBlock) {
    return suspendedBlock;
  }

  if (!identity.user.email_verified) {
    return {
      allowed: false,
      status: 403,
      message: "Verify your email to activate your account.",
      detail: "Email verification is required before requesting an upgrade.",
      reason: "email_verification_required",
      user: identity.user,
    };
  }

  return {
    allowed: true,
    user: identity.user,
  };
}
