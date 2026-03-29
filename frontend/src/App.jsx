import { useEffect, useMemo, useState } from "react";
import AccountPage from "./components/AccountPage";
import AdminPage from "./components/AdminPage";
import ApprovalStatusPage from "./components/ApprovalStatusPage";
import AuthPage from "./components/AuthPage";
import HomeScreen from "./components/HomeScreen";
import MultipleChoiceMode from "./components/MultipleChoiceMode";
import PaywallPage from "./components/PaywallPage";
import WrittenPromptMode from "./components/WrittenPromptMode";
import { fetchApi } from "./lib/api";

const AUTH_TOKEN_KEY = "nbct-auth-token";
const ANON_ID_KEY = "nbct-anon-id";

const modeConfig = {
  study: {
    id: "study",
    title: "Study Mode",
    eyebrow: "Multiple Choice",
    description:
      "Practice randomized questions with progress tracking, timer support, and a full review screen.",
    questionLimit: 20,
    tone: "study",
  },
  exam: {
    id: "exam",
    title: "Exam Mode",
    eyebrow: "Timed Simulation",
    description:
      "Work through a more restrained exam-style MCQ layout with tighter pacing and less coaching.",
    questionLimit: 30,
    tone: "exam",
  },
  written: {
    id: "written",
    title: "Written Prompt Practice",
    eyebrow: "Component 1",
    description:
      "Draft a constructed response in a realistic writing workspace, then review rubric-based feedback.",
  },
};

function getOrCreateAnonymousId() {
  const existing = window.localStorage.getItem(ANON_ID_KEY);

  if (existing) {
    return existing;
  }

  const nextId = crypto.randomUUID();
  window.localStorage.setItem(ANON_ID_KEY, nextId);
  return nextId;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function App() {
  const [activeMode, setActiveMode] = useState(null);
  const [view, setView] = useState("home");
  const [anonId, setAnonId] = useState(null);
  const [authToken, setAuthToken] = useState(
    window.localStorage.getItem(AUTH_TOKEN_KEY) ?? null,
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [usageSnapshot, setUsageSnapshot] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [verificationState, setVerificationState] = useState({
    status: "idle",
    message: "",
  });
  const [paywallState, setPaywallState] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUpgradeRequests, setAdminUpgradeRequests] = useState([]);
  const [emailProviderStatus, setEmailProviderStatus] = useState(null);

  useEffect(() => {
    setAnonId(getOrCreateAnonymousId());
  }, []);

  useEffect(() => {
    if (anonId) {
      refreshSessionState();
    }
  }, [anonId, authToken]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("verify");

    if (!token) {
      return;
    }

    verifyEmailToken(token);
  }, []);

  const requestHeaders = useMemo(() => {
    const headers = {
      "x-anon-id": anonId ?? "",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
  }, [anonId, authToken]);

  async function verifyEmailToken(token) {
    setVerificationState({
      status: "loading",
      message: "Verifying your email...",
    });

    const response = await fetchApi("/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const payload = await readJson(response);
    const url = new URL(window.location.href);
    url.searchParams.delete("verify");
    window.history.replaceState({}, "", url);

    if (!response.ok) {
      setVerificationState({
        status: "error",
        message: payload.message || "Verification failed.",
      });
      setView("approval");
      return;
    }

    setCurrentUser(payload.user ?? null);
    setVerificationState({
      status: "success",
      message: payload.message || "Email verified successfully.",
    });
    setView("approval");
  }

  async function refreshSessionState() {
    if (!anonId) {
      return;
    }

    const response = await fetchApi("/api/auth/me", {
      headers: {
        "x-anon-id": anonId,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    const payload = await readJson(response);
    setCurrentUser(payload.user ?? null);
    setUsageSnapshot(payload);
  }

  async function refreshAdminUsers() {
    if (!authToken || currentUser?.role !== "admin") {
      return;
    }

    const response = await fetchApi("/api/admin/users", {
      headers: requestHeaders,
    });

    if (!response.ok) {
      return;
    }

    const payload = await readJson(response);
    setAdminUsers(payload.users ?? []);
    setAdminNotifications(payload.notifications ?? []);
    setAdminUpgradeRequests(payload.upgrade_requests ?? []);
    setEmailProviderStatus(payload.email_provider ?? null);
  }

  async function handleAuthSubmit(mode, formState) {
    setAuthError("");
    setAuthNotice("");

    const payload =
      mode === "signup"
        ? {
            fullName: formState.fullName,
            email: formState.email,
            password: formState.password,
          }
        : {
            email: formState.email,
            password: formState.password,
          };

    const response = await fetchApi(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-anon-id": anonId ?? "",
      },
      body: JSON.stringify(payload),
    });

    const result = await readJson(response);

    if (!response.ok) {
      if (result.user) {
        setCurrentUser(result.user);
        setView("approval");
      }

      setAuthError(result.message || "Authentication failed.");
      return;
    }

    if (mode === "signup") {
      setCurrentUser(result.user ?? null);
      setVerificationState({
        status: result.email_delivery?.verification?.delivered ? "sent" : "error",
        message:
          result.message ||
          "Account created. Verify your email to activate your account.",
      });
      setView("approval");
      return;
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    setAuthToken(result.token);
    setCurrentUser(result.user);
    setView("home");
    await refreshSessionState();
  }

  async function handleLogout() {
    await fetchApi("/api/auth/logout", {
      method: "POST",
      headers: requestHeaders,
    });

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setCurrentUser(null);
    setAdminUsers([]);
    setAdminNotifications([]);
    setAdminUpgradeRequests([]);
    setEmailProviderStatus(null);
    setVerificationState({
      status: "idle",
      message: "",
    });
    setView("home");
  }

  async function handleUpgrade() {
    if (!currentUser) {
      setView("signup");
      return;
    }

    const response = await fetchApi("/api/billing/upgrade-request", {
      method: "POST",
      headers: requestHeaders,
    });

    const payload = await readJson(response);

    if (!response.ok) {
      setPaywallState(payload);
      setView(payload.reason === "email_verification_required" ? "approval" : "paywall");
      return;
    }

    setCurrentUser(payload.user ?? currentUser);
    setAuthNotice(payload.message || "Upgrade request submitted.");
    setPaywallState({
      message: payload.message,
      emailDelivery: payload.email_delivery,
    });
    setView("account");
    await refreshSessionState();
    await refreshAdminUsers();
  }

  function handleBlockedAccess(payload) {
    setActiveMode(null);
    setPaywallState(payload);

    if (payload?.reason === "email_verification_required") {
      setVerificationState({
        status: "error",
        message: payload.message || "Verify your email to continue.",
      });
      setView("approval");
      return;
    }

    setView("paywall");
  }

  async function handleUpdateUserStatus(userId, status) {
    const response = await fetchApi(`/api/admin/users/${userId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...requestHeaders,
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      await refreshAdminUsers();
    }
  }

  async function handleUpdateUpgradeRequest(requestId, status) {
    const notes = window.prompt("Optional admin note:", "") ?? "";
    const response = await fetchApi(`/api/admin/upgrades/${requestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...requestHeaders,
      },
      body: JSON.stringify({ status, notes }),
    });

    if (response.ok) {
      await refreshAdminUsers();
    }
  }

  async function handleResendVerification() {
    if (!currentUser?.email) {
      return;
    }

    const response = await fetchApi("/api/auth/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: currentUser.email,
      }),
    });

    const payload = await readJson(response);
    setVerificationState({
      status: response.ok && payload.email_delivery?.delivered ? "sent" : "error",
      message: payload.message || "Unable to resend verification email.",
    });
  }

  useEffect(() => {
    if (currentUser?.role === "admin") {
      refreshAdminUsers();
    }
  }, [currentUser]);

  if (view === "login" || view === "signup") {
    return (
      <AuthPage
        mode={view}
        onBack={() => {
          setAuthError("");
          setAuthNotice("");
          setView("home");
        }}
        onSubmit={(formState) => handleAuthSubmit(view, formState)}
        errorMessage={authError}
        noticeMessage={authNotice}
      />
    );
  }

  if (view === "account" && currentUser) {
    return (
      <AccountPage
        user={currentUser}
        usageSnapshot={usageSnapshot}
        onBack={() => setView("home")}
        onUpgrade={handleUpgrade}
        onLogout={handleLogout}
        noticeMessage={authNotice}
      />
    );
  }

  if (view === "approval") {
    return (
      <ApprovalStatusPage
        user={currentUser}
        verificationState={verificationState}
        onBack={() => setView("home")}
        onLogin={() => setView("login")}
        onResendVerification={handleResendVerification}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "admin" && currentUser?.role === "admin") {
    return (
      <AdminPage
        users={adminUsers}
        notifications={adminNotifications}
        upgradeRequests={adminUpgradeRequests}
        emailProviderStatus={emailProviderStatus}
        onBack={() => setView("home")}
        onRefresh={refreshAdminUsers}
        onUpdateUserStatus={handleUpdateUserStatus}
        onUpdateUpgradeRequest={handleUpdateUpgradeRequest}
      />
    );
  }

  if (view === "paywall") {
    return (
      <PaywallPage
        user={currentUser}
        message={paywallState?.message}
        onBack={() => setView("home")}
        onLogin={() => setView("login")}
        onSignup={() => setView("signup")}
        onUpgrade={handleUpgrade}
        onAccount={() => setView("account")}
      />
    );
  }

  if (activeMode === "study" || activeMode === "exam") {
    return (
      <MultipleChoiceMode
        mode={modeConfig[activeMode]}
        onBack={() => setActiveMode(null)}
        requestHeaders={requestHeaders}
        onBlocked={handleBlockedAccess}
      />
    );
  }

  if (activeMode === "written") {
    return (
      <WrittenPromptMode
        onBack={() => setActiveMode(null)}
        requestHeaders={requestHeaders}
        onBlocked={handleBlockedAccess}
      />
    );
  }

  return (
    <HomeScreen
      modes={Object.values(modeConfig)}
      onSelectMode={(modeId) => setActiveMode(modeId)}
      currentUser={currentUser}
      usageSnapshot={usageSnapshot}
      onLogin={() => setView("login")}
      onSignup={() => setView("signup")}
      onAccount={() => setView("account")}
      onLogout={handleLogout}
      onUpgrade={handleUpgrade}
      onAdmin={() => setView("admin")}
    />
  );
}
