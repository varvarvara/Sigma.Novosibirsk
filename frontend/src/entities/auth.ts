import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_STORAGE_KEY = "sigma_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "sigma_refresh_token";
const REMEMBER_ME_STORAGE_KEY = "sigma_remember_me";
const REMEMBERED_EMAIL_STORAGE_KEY = "sigma_remembered_email";


const authClient = axios.create({
    baseURL: API_BASE_URL,
});

type ApiErrorBody = {
    detail?: string | {msg?: string | unknown};
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
};

export type TokenType = "bearer";

export type AuthTokens = {
    access_token: string;
    refresh_token: string | null;
    token_type: TokenType;
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

export type RegistrationStatusResponse = {
    intake_closed: boolean;
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
}

export type PreRegistrationStatus = "PendingApproval" | "Approved";

export type StaffPreRegistrationResponse = StaffPreRegistrationRequest & {
    id: number;
    pre_registration_status: PreRegistrationStatus;
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
};

function parseApiErrorBody(responseText: string) {
    if (!responseText) {
        return {};
    }

    try {
        return JSON.parse(responseText) as ApiErrorBody;
    } catch {
        return {};
    }
};

function getApiErrorBody(data: unknown): ApiErrorBody {
    if (!data) {
        return {};
    }

    if (typeof data === "string") {
        return parseApiErrorBody(data);
    }

    if (typeof data === "object") {
        return data as ApiErrorBody;
    }

    return {};
};

export function toAuthApiError(error: unknown, fallbackMessage = "Ошибка запроса к серверу") {
    if (error instanceof AuthApiError) {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        return new AuthApiError(fallbackMessage, 0, error);
    }

    if (!error.response) {
        return new AuthApiError(
            "Не удалось подключиться к серверу. Попробуйте позже.",
            0,
            error,
        );
    }

    const body = getApiErrorBody(error.response.data);

    return new AuthApiError(
        getErrorMessage(body, fallbackMessage),
        error.response.status,
        body.detail,
    );
};

function isRememberMeEnabled() {
    return localStorage.getItem(REMEMBER_ME_STORAGE_KEY) === "1";
};

function readTokenFromStorages(key: string) {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
};

export async function login(data: LoginRequest) {
    try {
        const response = await authClient.post<AuthTokens>("/auth/login", {
            email: data.email,
            password: data.password,
            remember_me: Boolean(data.remember_me),
        });

        return response.data;
    } catch (error) {
        throw toAuthApiError(error);
    }
};

export async function refreshToken(data: RefreshTokenRequest) {
    try {
        const response = await authClient.post<AuthTokens>("/auth/refresh", data);
        return response.data;
    } catch (error) {
        throw toAuthApiError(error);
    }
};

export async function logout(data: LogoutRequest, accessToken?: string | null) {
    try {
        await authClient.post("/auth/logout", data, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
    } catch (error) {
        throw toAuthApiError(error);
    }
};

export async function requestPasswordReset(data: PasswordResetRequest) {
    try {
        const response = await authClient.post<MessageResponse>("/auth/password-reset/request", data);
        return response.data;
    } catch (error) {
        throw toAuthApiError(error);
    }
};

export async function confirmPasswordReset(data: PasswordResetConfirmRequest) {
    try {
        const response = await authClient.post<MessageResponse>("/auth/password-reset/confirm", data);
        return response.data;
    } catch (error) {
        throw toAuthApiError(error);
    }
};

export async function getRegistrationStatus() {
    try {
        const response = await authClient.get<RegistrationStatusResponse>("/auth/registration/status");
        return response.data;
    } catch (error) {
        throw toAuthApiError(error);
    }
};

export async function staffPreRegistration(data: StaffPreRegistrationRequest) {
    try {
        const response = await authClient.post<StaffPreRegistrationResponse>(
            "/auth/staff/pre-registration",
            data,
        );
        return response.data;
    } catch (error) {
        throw toAuthApiError(error);
    }
};

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
};

export function getRememberMePreference() {
    return isRememberMeEnabled();
};

export function getRememberedEmail() {
    return localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY) ?? "";
};

export function saveRememberedEmail(email: string, rememberMe: boolean) {
    if (rememberMe && email.trim()) {
        localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, email.trim());
        return;
    }

    localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
};

export function getAccessToken() {
    return readTokenFromStorages(ACCESS_TOKEN_STORAGE_KEY);
};

export function getRefreshToken() {
    return readTokenFromStorages(REFRESH_TOKEN_STORAGE_KEY);
};

export function clearAuthTokens() {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

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
};

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
};
