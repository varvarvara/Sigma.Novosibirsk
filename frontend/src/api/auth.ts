export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const ACCESS_TOKEN_STORAGE_KEY = "sigma_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "sigma_refresh_token";

export type TokenType = "bearer";

export type AuthTokens = {
  access_token: string;
  refresh_token: string | null;
  token_type: TokenType;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type LogoutRequest = {
  refresh_token?: string | null;
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
    const firstMessage = body.detail
      .map((item) => item?.msg)
      .find((message): message is string => typeof message === "string");

    if (firstMessage) {
      return firstMessage;
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

export async function request<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    throw new AuthApiError(
      "Не удалось подключиться к серверу. Проверьте, что backend запущен.",
      0,
      error,
    );
  }

  if (!response.ok) {
    const responseText = await response.text();
    const body = parseApiErrorBody(responseText);
    throw new AuthApiError(
      getErrorMessage(body, responseText || "Ошибка запроса к серверу"),
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
    body: JSON.stringify(data),
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

export function staffPreRegistration(data: StaffPreRegistrationRequest) {
  return request<StaffPreRegistrationResponse>("/auth/staff/pre-registration", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function saveAuthTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.access_token);

  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}
