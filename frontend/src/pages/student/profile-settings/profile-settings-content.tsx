import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { CameraPlus } from "@untitledui/icons/CameraPlus";
import { AuthApiError, clearAuthTokens, getAccessToken } from "../../../entities/auth";
import {
    useCurrentUserQuery,
    useUpdateMyAvatarMutation,
    useUpdateMyStudentProfileMutation,
} from "../../../entities/student/queries/profile.queries";
import type { CurrentUser, Student } from "../../../entities/student/model/profile.types";
import {
    buildStudentUpdatePayload,
    getStudentDraft,
    type StudentProfileDraft,
} from "../../../features/profile-edit/student-profile-form";
import { SettingsField } from "../../../features/profile-edit/ui/settings-field";
import "./profile-settings.css";

const DEFAULT_AVATAR_SRC = "/default-avatar.svg";
const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const GRADE_OPTIONS = [8, 9, 10, 11] as const;

function isStudentProfile(user: CurrentUser | null | undefined): user is Student {
    return Boolean(user && typeof user === "object" && "year_of_study" in user);
}

function getFullName(user: CurrentUser | null) {
    if (!user) {
        return "Загрузка профиля";
    }

    return [user.last_name, user.first_name, user.partonymic].filter(Boolean).join(" ");
}

export default function ProfileSettingsContent() {
    const navigate = useNavigate();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [draft, setDraft] = useState<StudentProfileDraft>(getStudentDraft(null));
    const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR_SRC);
    const [isEditing, setIsEditing] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        data: currentUser,
        isLoading,
        error: profileError,
    } = useCurrentUserQuery();
    const updateProfileMutation = useUpdateMyStudentProfileMutation();
    const uploadAvatarMutation = useUpdateMyAvatarMutation();

    const student = currentUser && isStudentProfile(currentUser) ? currentUser : null;
    const fullName = getFullName(currentUser);
    const savedDraft = getStudentDraft(student);
    const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
    const isSaving = updateProfileMutation.isPending;
    const isAvatarUploading = uploadAvatarMutation.isPending;
    const isFormDisabled = isLoading || isSaving || !isEditing;

    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            navigate({ to: "/login" });
            return;
        }

        if (profileError instanceof AuthApiError && profileError.status === 401) {
            clearAuthTokens();
            navigate({ to: "/login" });
            return;
        }

        if (profileError) {
            setErrorMessage("Не удалось загрузить профиль.");
        }
    }, [navigate, profileError]);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        setAvatarSrc(currentUser.avatar_url ?? DEFAULT_AVATAR_SRC);
        setDraft(isStudentProfile(currentUser) ? getStudentDraft(currentUser) : getStudentDraft(null));
    }, [currentUser]);

    const updateDraft = (field: keyof StudentProfileDraft, value: string) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
        setStatusMessage(null);
        setErrorMessage(null);
    };

    const startEditing = () => {
        setDraft(savedDraft);
        setIsEditing(true);
        setStatusMessage(null);
        setErrorMessage(null);
    };

    const cancelEditing = () => {
        setDraft(savedDraft);
        setIsEditing(false);
        setErrorMessage(null);
    };

    const saveProfile = async () => {
        if (!student || updateProfileMutation.isPending) {
            return;
        }

        const payload = buildStudentUpdatePayload(draft);
        if (payload.birth_date === undefined) {
            setErrorMessage("Укажите дату рождения полностью или очистите все поля.");
            return;
        }

        setStatusMessage(null);
        setErrorMessage(null);

        try {
            const updated = await updateProfileMutation.mutateAsync(payload);
            setDraft(getStudentDraft(updated));
            setIsEditing(false);
            setStatusMessage("Изменения сохранены");
        } catch (error) {
            if (error instanceof AuthApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Не удалось сохранить изменения.");
            }
        }
    };

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            setErrorMessage("Нужно выбрать файл изображения.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > AVATAR_MAX_SIZE_BYTES) {
            setErrorMessage("Максимальный размер аватара: 5 МБ.");
            event.target.value = "";
            return;
        }

        setStatusMessage(null);
        setErrorMessage(null);

        try {
            const uploaded = await uploadAvatarMutation.mutateAsync(selectedFile);
            setAvatarSrc(uploaded.avatar_url || DEFAULT_AVATAR_SRC);
            setStatusMessage("Фото профиля обновлено");
        } catch (error) {
            if (error instanceof AuthApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Не удалось загрузить аватар.");
            }
        } finally {
            event.target.value = "";
        }
    };

    return (
        <main className="profile-settings-page">
            <header className="profile-settings-header">
                <button
                    className="back-button app-back-button app-back-button--dark"
                    type="button"
                    aria-label="Вернуться в профиль"
                    onClick={() => navigate({ to: "/profile" })}
                >
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </button>
                <h1>Настройки профиля</h1>
            </header>

            <div className="profile-settings-body">
                <div className="profile-settings-scroll">
                    <div className="profile-settings-sheet">
                        <section className="profile-settings-hero">
                            <img
                                className="profile-settings-avatar"
                                src={avatarSrc}
                                alt="Аватар пользователя"
                                onError={() => setAvatarSrc(DEFAULT_AVATAR_SRC)}
                            />
                            <h2 className="profile-settings-hero-name">{fullName}</h2>
                            <p className="profile-settings-hero-email">{currentUser?.email ?? "Почта"}</p>
                            <button
                                className="profile-settings-photo-button"
                                type="button"
                                disabled={isAvatarUploading}
                                onClick={() => avatarInputRef.current?.click()}
                            >
                                <CameraPlus size={16} color="currentColor" />
                                {isAvatarUploading ? "Загрузка..." : "Изменить фото"}
                            </button>
                            <input
                                ref={avatarInputRef}
                                className="profile-settings-photo-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </section>

                        {statusMessage ? (
                            <p className="profile-settings-status profile-settings-status--success">{statusMessage}</p>
                        ) : null}
                        {errorMessage ? (
                            <p className="profile-settings-status profile-settings-status--error">{errorMessage}</p>
                        ) : null}

                        <div className="profile-settings-form">
                            <section className="profile-settings-section">
                                <h2 className="profile-settings-section-title">Настройка аккаунта</h2>
                                <div className="profile-settings-fields">
                                    <SettingsField
                                        id="student-settings-email"
                                        label="Почта"
                                        value={currentUser?.email ?? ""}
                                        isEditing={false}
                                        isDisabled
                                        onChange={() => undefined}
                                    />
                                </div>
                            </section>

                            <section className="profile-settings-section">
                                <h2 className="profile-settings-section-title">Личная информация</h2>
                                <div className="profile-settings-fields">
                                    <SettingsField
                                        id="student-settings-first-name"
                                        label="Имя"
                                        value={draft.first_name}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        onChange={(value) => updateDraft("first_name", value)}
                                    />
                                    <SettingsField
                                        id="student-settings-last-name"
                                        label="Фамилия"
                                        value={draft.last_name}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        onChange={(value) => updateDraft("last_name", value)}
                                    />
                                    <SettingsField
                                        id="student-settings-patronymic"
                                        label="Отчество"
                                        value={draft.partonymic}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        onChange={(value) => updateDraft("partonymic", value)}
                                    />
                                    <div className="profile-settings-field">
                                        <span className="profile-settings-field-label">Дата рождения</span>
                                        <div className="profile-settings-date-row">
                                            <input
                                                className="profile-settings-control"
                                                type="text"
                                                inputMode="numeric"
                                                value={draft.birth_day}
                                                readOnly={!isEditing}
                                                disabled={isFormDisabled}
                                                placeholder="DD"
                                                maxLength={2}
                                                onChange={(event) => updateDraft("birth_day", event.target.value)}
                                            />
                                            <input
                                                className="profile-settings-control"
                                                type="text"
                                                inputMode="numeric"
                                                value={draft.birth_month}
                                                readOnly={!isEditing}
                                                disabled={isFormDisabled}
                                                placeholder="MM"
                                                maxLength={2}
                                                onChange={(event) => updateDraft("birth_month", event.target.value)}
                                            />
                                            <input
                                                className="profile-settings-control"
                                                type="text"
                                                inputMode="numeric"
                                                value={draft.birth_year}
                                                readOnly={!isEditing}
                                                disabled={isFormDisabled}
                                                placeholder="YYYY"
                                                maxLength={4}
                                                onChange={(event) => updateDraft("birth_year", event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <SettingsField
                                        id="student-settings-school"
                                        label="Место обучения"
                                        value={draft.school}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        onChange={(value) => updateDraft("school", value)}
                                    />
                                    <div className="profile-settings-field">
                                        <label htmlFor="student-settings-grade">Класс (на 2026-2027 учебный год)</label>
                                        <select
                                            id="student-settings-grade"
                                            className="profile-settings-control"
                                            value={draft.year_of_study}
                                            disabled={isFormDisabled}
                                            onChange={(event) => updateDraft("year_of_study", event.target.value)}
                                        >
                                            <option value="" disabled>
                                                Выберите класс
                                            </option>
                                            {GRADE_OPTIONS.map((grade) => (
                                                <option key={grade} value={String(grade)}>
                                                    {grade} класс
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <SettingsField
                                        id="student-settings-city"
                                        label="Адрес проживания"
                                        value={draft.city}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        onChange={(value) => updateDraft("city", value)}
                                    />
                                </div>
                            </section>

                            <section className="profile-settings-section">
                                <h2 className="profile-settings-section-title">Контакты</h2>
                                <div className="profile-settings-fields">
                                    <SettingsField
                                        id="student-settings-phone"
                                        label="Номер телефона"
                                        type="tel"
                                        value={draft.phone}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        placeholder="+79990000000"
                                        onChange={(value) => updateDraft("phone", value)}
                                    />
                                    <SettingsField
                                        id="student-settings-telegram"
                                        label="Ник в Telegram / Вконтакте"
                                        value={draft.tg_nickname}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        placeholder="@username"
                                        onChange={(value) => updateDraft("tg_nickname", value)}
                                    />
                                </div>
                            </section>

                            <section className="profile-settings-section">
                                <h2 className="profile-settings-section-title">Информация о родителе / опекуне</h2>
                                <div className="profile-settings-fields">
                                    <SettingsField
                                        id="student-settings-parent-name"
                                        label="ФИО родителя / опекуна"
                                        value={draft.parent_name}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        onChange={(value) => updateDraft("parent_name", value)}
                                    />
                                    <SettingsField
                                        id="student-settings-parent-phone"
                                        label="Номер телефона"
                                        type="tel"
                                        value={draft.parent_phone}
                                        isEditing={isEditing}
                                        isDisabled={isFormDisabled}
                                        placeholder="+79990000000"
                                        onChange={(value) => updateDraft("parent_phone", value)}
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <footer className="profile-settings-footer">
                    {isEditing ? (
                        <div className="profile-settings-actions">
                            <button
                                className="profile-settings-button profile-settings-button--ghost"
                                type="button"
                                onClick={cancelEditing}
                                disabled={isSaving}
                            >
                                Отменить
                            </button>
                            <button
                                className="profile-settings-button profile-settings-button--primary"
                                type="button"
                                onClick={() => void saveProfile()}
                                disabled={isSaving || !isDirty}
                            >
                                {isSaving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    ) : (
                        <button
                            className="profile-settings-button profile-settings-button--primary"
                            type="button"
                            onClick={startEditing}
                            disabled={isLoading || !student}
                        >
                            Изменить
                        </button>
                    )}
                </footer>
            </div>
        </main>
    );
}
