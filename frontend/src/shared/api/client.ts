import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import {
    API_BASE_URL,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    getRememberMePreference,
    refreshToken,
    saveAuthTokens,
    toAuthApiError,
} from "../../entities/auth";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

let refreshRequest: Promise<string | null> | null = null;

function shouldAttemptTokenRefresh(url?: string) {
    if (!url) {
        return false;
    }

    return !url.startsWith("/auth/login") &&
        !url.startsWith("/auth/refresh") &&
        !url.startsWith("/auth/logout") &&
        !url.startsWith("/auth/password-reset");
}

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
}

async function refreshAccessToken() {
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
        clearAuthTokens();
        return null;
    }

    try {
        const tokens = await refreshToken({ refresh_token: refreshTokenValue });
        saveAuthTokens(tokens, getRememberMePreference());
        return tokens.access_token;
    } catch {
        clearAuthTokens();
        return null;
    }
}

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        setAuthorizationHeader(config, token);
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(toAuthApiError(error));
        }

        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;

        if (
            status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            !shouldAttemptTokenRefresh(originalRequest.url)
        ) {
            return Promise.reject(toAuthApiError(error));
        }

        originalRequest._retry = true;

        refreshRequest ??= refreshAccessToken().finally(() => {
            refreshRequest = null;
        });

        const newAccessToken = await refreshRequest;

        if (!newAccessToken) {
            return Promise.reject(toAuthApiError(error));
        }

        setAuthorizationHeader(originalRequest, newAccessToken);

        try {
            return await apiClient.request(originalRequest);
        } catch (retryError) {
            return Promise.reject(toAuthApiError(retryError));
        }
    },
);
