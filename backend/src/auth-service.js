import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import "./env-service.js";
import { readJsonFile, writeJsonFile } from "./storage-service.js";

const USERS_FILE = "users.json";
const TOKENS_FILE = "auth-tokens.json";
const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || "giteshpandya@gmail.com",
).trim().toLowerCase();

function getUsers() {
  return readJsonFile(USERS_FILE, []);
}

function saveUsers(users) {
  writeJsonFile(USERS_FILE, users);
}

function getTokens() {
  return readJsonFile(TOKENS_FILE, []);
}

function saveTokens(tokens) {
  writeJsonFile(TOKENS_FILE, tokens);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function hashLegacyPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyLegacyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash ?? "").split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, "hex"),
    Buffer.from(actualHash, "hex"),
  );
}

function verifyPassword(password, storedHash) {
  const hashValue = String(storedHash ?? "");

  if (hashValue.startsWith("$2")) {
    return bcrypt.compareSync(password, hashValue);
  }

  return verifyLegacyPassword(password, hashValue);
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sanitizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role ?? "user",
    email_verified: Boolean(user.email_verified),
    email_verified_at: user.email_verified_at,
    account_status: user.account_status ?? "active",
    free_usage_count_today: user.free_usage_count_today ?? 0,
    last_free_usage_date: user.last_free_usage_date,
    upgrade_status: user.upgrade_status ?? "none",
    upgrade_requested_at: user.upgrade_requested_at,
    upgrade_approved_at: user.upgrade_approved_at,
    upgrade_approved_by: user.upgrade_approved_by,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function getUserByEmailRecord(email) {
  const normalizedEmail = normalizeEmail(email);
  return getUsers().find((item) => item.email === normalizedEmail) ?? null;
}

export function createUser({ fullName, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const users = getUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with that email already exists.");
  }

  const now = new Date().toISOString();
  const isAdmin = normalizedEmail === ADMIN_EMAIL;
  const user = {
    id: crypto.randomUUID(),
    full_name: String(fullName).trim(),
    email: normalizedEmail,
    password_hash: hashPassword(password),
    role: isAdmin ? "admin" : "user",
    email_verified: isAdmin,
    email_verified_at: isAdmin ? now : null,
    account_status: "active",
    free_usage_count_today: 0,
    last_free_usage_date: null,
    upgrade_status: "none",
    upgrade_requested_at: null,
    upgrade_approved_at: null,
    upgrade_approved_by: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    created_at: now,
    updated_at: now,
  };

  users.push(user);
  saveUsers(users);
  return sanitizeUser(user);
}

export function authenticateUser({ email, password }) {
  const user = getUserByEmailRecord(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new Error("Invalid email or password.");
  }

  return sanitizeUser(user);
}

export function createAuthToken(userId) {
  const tokens = getTokens();
  const token = crypto.randomBytes(32).toString("hex");
  tokens.push({
    token,
    user_id: userId,
    created_at: new Date().toISOString(),
  });
  saveTokens(tokens);
  return token;
}

export function revokeAuthToken(token) {
  const tokens = getTokens().filter((item) => item.token !== token);
  saveTokens(tokens);
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.authorization ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

export function getUserByToken(token) {
  if (!token) {
    return null;
  }

  const session = getTokens().find((item) => item.token === token);

  if (!session) {
    return null;
  }

  const user = getUsers().find((item) => item.id === session.user_id);
  return user ? sanitizeUser(user) : null;
}

export function getUserById(userId) {
  const user = getUsers().find((item) => item.id === userId);
  return user ? sanitizeUser(user) : null;
}

export function listUsers() {
  return getUsers()
    .map(sanitizeUser)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function updateUser(userId, updater) {
  const users = getUsers();
  const index = users.findIndex((item) => item.id === userId);

  if (index === -1) {
    return null;
  }

  const nextUser = {
    ...users[index],
    ...updater(users[index]),
    updated_at: new Date().toISOString(),
  };

  users[index] = nextUser;
  saveUsers(users);
  return sanitizeUser(nextUser);
}

export function verifyUserEmail(userId) {
  return updateUser(userId, (current) => ({
    email_verified: true,
    email_verified_at: current.email_verified_at ?? new Date().toISOString(),
  }));
}

export function updateAccountStatus({ targetUserId, status }) {
  return updateUser(targetUserId, () => ({
    account_status: status,
  }));
}

export function updateUpgradeStatus({
  targetUserId,
  status,
  actedBy = null,
}) {
  const now = new Date().toISOString();

  return updateUser(targetUserId, (current) => ({
    upgrade_status: status,
    upgrade_requested_at:
      status === "pending"
        ? current.upgrade_requested_at ?? now
        : current.upgrade_requested_at,
    upgrade_approved_at: status === "approved" ? now : null,
    upgrade_approved_by: status === "approved" ? actedBy : null,
  }));
}

export function createPasswordResetRequest(email) {
  const user = getUserByEmailRecord(email);

  if (!user) {
    return null;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = new Date(now + 60 * 60 * 1000).toISOString();
  const tokenHash = hashResetToken(rawToken);

  updateUser(user.id, () => ({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  }));

  return {
    user: sanitizeUser(user),
    rawToken,
    expiresAt,
  };
}

export function resetPasswordWithToken({ token, newPassword }) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const tokenHash = hashResetToken(token);
  const now = Date.now();
  const users = getUsers();
  const targetUser = users.find((user) => {
    if (!user.passwordResetTokenHash || user.passwordResetTokenHash !== tokenHash) {
      return false;
    }

    if (!user.passwordResetExpiresAt) {
      return false;
    }

    return new Date(user.passwordResetExpiresAt).getTime() > now;
  });

  if (!targetUser) {
    throw new Error("Reset token is invalid or expired.");
  }

  return updateUser(targetUser.id, () => ({
    password_hash: hashPassword(newPassword),
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  }));
}

export function seedLegacyPasswordForTesting({ userId, password }) {
  return updateUser(userId, () => ({
    password_hash: hashLegacyPassword(password),
  }));
}
