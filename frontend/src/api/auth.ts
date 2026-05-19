export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const ACCESS_TOKEN_STORAGE_KEY = "sigma_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "sigma_refresh_token";
const REMEMBER_ME_STORAGE_KEY = "sigma_remember_me";
const REMEMBERED_EMAIL_STORAGE_KEY = "sigma_remembered_email";

export type TokenType = "bearer";

export type AuthTokens = {
  access_token: string;
  refresh_token: string | null;
  token_type: TokenType;
};

export type AccessTokenPayload = {
  sub?: string;
  user_type?: "student" | "staff";
  staff_role?: string | null;
  exp?: number;
  jti?: string;
  type?: "access";
};

export type AuthSession = {
  accessToken: string;
  userType: "student" | "staff";
  staffRole: string | null;
  userId: number | null;
};

export type LoginRequest = {
  email: string;
  password: string;
  remember_me?: boolean;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type LogoutRequest = {
  refresh_token?: string | null;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetConfirmRequest = {
  token: string;
  password: string;
};

export type MessageResponse = {
  message: string;
};

export type TeacherCourseType = "Olympiad" | "Author";

export type StaffPreRegistrationRequest = {
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  phone: string;
  email: string;
  tg_nickname?: string | null;
  season_id: number;
  birth_date: string;
  university: string;
  study_direction: string;
  study_year: number;
  proposed_course_title: string;
  proposed_course_type: TeacherCourseType;
  proposed_course_description: string;
};

export type PreRegistrationStatus = "PendingApproval" | "Approved";

export type StaffPreRegistrationResponse = StaffPreRegistrationRequest & {
  id: number;
  pre_registration_status: PreRegistrationStatus;
};

type ApiErrorBody = {
  detail?: string | { msg?: string }[] | unknown;
};

export class AuthApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.details = details;
  }
}

function getErrorMessage(body: ApiErrorBody, fallback: string) {
  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body.detail)) {
    const firstItem = body.detail.find((item) => item && typeof item === "object");
    if (firstItem && typeof firstItem === "object" && "msg" in firstItem) {
      const message = (firstItem as { msg?: string }).msg;
      if (typeof message === "string" && message.length > 0) {
        if (message.includes("JSON decode error")) {
          return "Неверный формат данных. Проверьте JSON в запросе.";
        }
        if (message.includes("value is not a valid email address")) {
          return "Укажите корректный email.";
        }
        return message;
      }
    }
  }

  return fallback;
}

function parseApiErrorBody(responseText: string): ApiErrorBody {
  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText) as ApiErrorBody;
  } catch {
    return {};
  }
}

function shouldSetJsonContentType(body: RequestInit["body"]) {
  return !(body instanceof FormData);
}

function buildHeaders(options: RequestInit) {
  const headers = new Headers(options.headers ?? undefined);
  if (shouldSetJsonContentType(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

function withApiBase(path: string) {
  return `${API_BASE_URL}${path}`;
}

function isRememberMeEnabled() {
  return localStorage.getItem(REMEMBER_ME_STORAGE_KEY) === "1";
}

function readTokenFromStorages(key: string) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

async function tryRefreshAccessToken(): Promise<AuthTokens | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    return null;
  }

  try {
    const response = await fetch(withApiBase("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!response.ok) {
      clearAuthTokens();
      return null;
    }

    const tokens = (await response.json()) as AuthTokens;
    saveAuthTokens(tokens, isRememberMeEnabled());
    return tokens;
  } catch {
    clearAuthTokens();
    return null;
  }
}

function shouldAttemptTokenRefresh(path: string) {
  return !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/refresh") &&
    !path.startsWith("/auth/logout") &&
    !path.startsWith("/auth/password-reset");
}

export async function request<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  let response: Response;
  const headers = buildHeaders(options);
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    response = await fetch(withApiBase(path), requestOptions);
  } catch (error) {
    throw new AuthApiError(
      "Не удалось подключиться к серверу. Попробуйте позже.",
      0,
      error,
    );
  }

  if (response.status === 401 && shouldAttemptTokenRefresh(path)) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      const retryHeaders = buildHeaders(options);
      retryHeaders.set("Authorization", `Bearer ${refreshed.access_token}`);

      try {
        response = await fetch(withApiBase(path), {
          ...options,
          headers: retryHeaders,
        });
      } catch (error) {
        throw new AuthApiError(
          "Не удалось подключиться к серверу. Попробуйте позже.",
          0,
          error,
        );
      }
    }
  }

  if (!response.ok) {
    const responseText = await response.text();
    const body = parseApiErrorBody(responseText);
    throw new AuthApiError(
      getErrorMessage(body, "Ошибка запроса к серверу"),
      response.status,
      body.detail,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export function login(data: LoginRequest) {
  return request<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      remember_me: Boolean(data.remember_me),
    }),
  });
}

export function refreshToken(data: RefreshTokenRequest) {
  return request<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout(data: LogoutRequest, accessToken?: string | null) {
  return request<void>("/auth/logout", {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: JSON.stringify(data),
  });
}

export function requestPasswordReset(data: PasswordResetRequest) {
  return request<MessageResponse>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function confirmPasswordReset(data: PasswordResetConfirmRequest) {
  return request<MessageResponse>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function staffPreRegistration(data: StaffPreRegistrationRequest) {
  return request<StaffPreRegistrationResponse>("/auth/staff/pre-registration", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function saveAuthTokens(tokens: AuthTokens, rememberMe = false) {
  const activeStorage = rememberMe ? localStorage : sessionStorage;
  const inactiveStorage = rememberMe ? sessionStorage : localStorage;

  activeStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.access_token);
  inactiveStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

  if (tokens.refresh_token) {
    activeStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token);
    inactiveStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } else {
    activeStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    inactiveStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  localStorage.setItem(REMEMBER_ME_STORAGE_KEY, rememberMe ? "1" : "0");
}

export function getRememberMePreference() {
  return isRememberMeEnabled();
}

export function getRememberedEmail() {
  return localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY) ?? "";
}

export function saveRememberedEmail(email: string, rememberMe: boolean) {
  if (rememberMe && email.trim()) {
    localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, email.trim());
    return;
  }
  localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
}

export function getAccessToken() {
  return readTokenFromStorages(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  return readTokenFromStorages(REFRESH_TOKEN_STORAGE_KEY);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function parseAccessTokenPayload(token: string): AccessTokenPayload | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length < 2) {
      return null;
    }

    const normalized = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  const payload = parseAccessTokenPayload(accessToken);
  if (!payload || payload.type !== "access" || !payload.user_type) {
    return null;
  }

  const numericUserId = payload.sub ? Number(payload.sub) : NaN;
  return {
    accessToken,
    userType: payload.user_type,
    staffRole: payload.staff_role ?? null,
    userId: Number.isFinite(numericUserId) ? numericUserId : null,
  };
}

export function isAuthenticated() {
  return getAuthSession() !== null;
}
