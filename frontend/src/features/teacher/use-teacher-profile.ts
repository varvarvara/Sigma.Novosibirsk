import { type ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthApiError, clearAuthTokens, getAccessToken, getRefreshToken, logout } from "../../entities/auth";
import {
    isStaffProfile,
} from "../../entities/student/model/profile.types";
import {
    useCurrentUserQuery,
    useDeleteMyAvatarMutation,
    useUpdateMyAvatarMutation,
    useUpdateMyStaffProfileMutation,
} from "../../entities/student/queries/profile.queries";
import { validateBirthDate } from "../auth/birth-date-validation";
import {
    dispatchTeacherProfileUpdated,
    readPersistedTeacherAvatarUrl,
} from "../../shared/teacher-profile-events";
import {
    emptyTeacherProfileData,
    formatTeacherBirthDateForApi,
    mapStaffToTeacherProfile,
    TEACHER_AVATAR_MAX_SIZE_BYTES,
    TEACHER_DEFAULT_AVATAR_SRC,
    type TeacherProfileData,
} from "./teacher-profile";

type BirthField = "birthDay" | "birthMonth" | "birthYear";
type ProfileField = Exclude<keyof TeacherProfileData, "email" | BirthField>;

export function useTeacherProfile() {
    const navigate = useNavigate();
    const [birthDateError, setBirthDateError] = useState<string | null>(null);
    const [avatarSrc, setAvatarSrc] = useState<string | null>(readPersistedTeacherAvatarUrl() ?? TEACHER_DEFAULT_AVATAR_SRC);
    const [profileData, setProfileData] = useState<TeacherProfileData>(emptyTeacherProfileData);
    const [draftProfileData, setDraftProfileData] = useState<TeacherProfileData>(emptyTeacherProfileData);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [saveNotice, setSaveNotice] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const {
        data: currentUser,
        isLoading: isProfileLoading,
        error: currentUserError,
    } = useCurrentUserQuery();
    const updateProfileMutation = useUpdateMyStaffProfileMutation();
    const uploadAvatarMutation = useUpdateMyAvatarMutation();
    const deleteAvatarMutation = useDeleteMyAvatarMutation();

    const isProfileSaving = updateProfileMutation.isPending;
    const isAvatarUploading = uploadAvatarMutation.isPending || deleteAvatarMutation.isPending;

    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            navigate({ to: "/login" });
            return;
        }

        if (currentUserError instanceof AuthApiError && currentUserError.status === 401) {
            clearAuthTokens();
            navigate({ to: "/login" });
            return;
        }

        if (currentUserError) {
            setProfileError("Не удалось загрузить профиль");
            return;
        }

        if (currentUser && !isStaffProfile(currentUser)) {
            setProfileError("Эта страница доступна только преподавателям");
            return;
        }

        setProfileError(null);
    }, [currentUser, currentUserError, navigate]);

    useEffect(() => {
        if (!currentUser || !isStaffProfile(currentUser)) {
            return;
        }

        const mapped = mapStaffToTeacherProfile(currentUser);
        setProfileData(mapped);
        setDraftProfileData(mapped);
        const nextAvatar = currentUser.avatar_url ?? TEACHER_DEFAULT_AVATAR_SRC;
        setAvatarSrc(nextAvatar);
        dispatchTeacherProfileUpdated({
            avatarUrl: nextAvatar,
            firstName: mapped.firstName,
            lastName: mapped.lastName,
            patronymic: mapped.patronymic,
            email: mapped.email,
        });
        setIsEditing(false);
    }, [currentUser]);

    const startEditing = () => {
        setDraftProfileData(profileData);
        setBirthDateError(null);
        setSaveError(null);
        setSaveNotice(null);
        setIsEditing(true);
    };

    const handleFieldChange = (field: ProfileField, value: string) => {
        if (!isEditing) {
            return;
        }

        setDraftProfileData((current) => ({ ...current, [field]: value }));
        setSaveNotice(null);
        setSaveError(null);
    };

    const handleBirthChange = (field: BirthField, value: string) => {
        if (!isEditing) {
            return;
        }

        const digits = value.replace(/\D/g, "");
        const maxLength = field === "birthYear" ? 4 : 2;
        const nextValue = digits.slice(0, maxLength);

        if (field === "birthDay" && nextValue.length === 2) {
            const day = Number(nextValue);
            if (day < 1 || day > 31) {
                return;
            }
        }

        if (field === "birthMonth" && nextValue.length === 2) {
            const month = Number(nextValue);
            if (month < 1 || month > 12) {
                return;
            }
        }

        setDraftProfileData((current) => ({ ...current, [field]: nextValue }));
        setBirthDateError(null);
        setSaveNotice(null);
        setSaveError(null);
    };

    const uploadAvatarFile = async (selectedFile: File) => {
        if (!isEditing) {
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            alert("Нужно выбрать файл изображения.");
            return;
        }

        if (selectedFile.size > TEACHER_AVATAR_MAX_SIZE_BYTES) {
            alert("Максимальный размер аватара: 5 МБ.");
            return;
        }

        try {
            const uploaded = await uploadAvatarMutation.mutateAsync(selectedFile);
            const nextAvatar = uploaded.avatar_url || TEACHER_DEFAULT_AVATAR_SRC;
            setAvatarSrc(nextAvatar);
            dispatchTeacherProfileUpdated({ avatarUrl: nextAvatar });
            setSaveNotice("Аватар обновлён");
            setSaveError(null);
        } catch (error) {
            if (error instanceof AuthApiError) {
                alert(error.message);
            } else {
                alert("Не удалось загрузить аватар.");
            }
        }
    };

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        try {
            await uploadAvatarFile(selectedFile);
        } finally {
            event.target.value = "";
        }
    };

    const handleDeleteAvatar = async () => {
        if (!isEditing) {
            return;
        }

        try {
            const user = await deleteAvatarMutation.mutateAsync();
            const nextAvatar = isStaffProfile(user) ? user.avatar_url ?? TEACHER_DEFAULT_AVATAR_SRC : TEACHER_DEFAULT_AVATAR_SRC;
            setAvatarSrc(nextAvatar);
            dispatchTeacherProfileUpdated({ avatarUrl: nextAvatar });
            setSaveNotice("Аватар удалён");
            setSaveError(null);
        } catch (error) {
            if (error instanceof AuthApiError) {
                alert(error.message);
            } else {
                alert("Не удалось удалить аватар.");
            }
        }
    };

    const saveProfile = async () => {
        const firstName = draftProfileData.firstName.trim();
        const lastName = draftProfileData.lastName.trim();

        if (!firstName || !lastName) {
            setSaveError("Укажите имя и фамилию");
            return;
        }

        const { birthDay, birthMonth, birthYear } = draftProfileData;
        const hasBirthInput = Boolean(birthDay || birthMonth || birthYear);

        if (hasBirthInput) {
            const birthError = validateBirthDate(birthDay, birthMonth, birthYear);
            if (birthError) {
                setBirthDateError(birthError);
                return;
            }
        }

        setBirthDateError(null);
        setSaveError(null);
        setSaveNotice(null);

        try {
            const updated = await updateProfileMutation.mutateAsync({
                first_name: firstName,
                last_name: lastName,
                partonymic: draftProfileData.patronymic.trim() || null,
                birth_date: hasBirthInput ? formatTeacherBirthDateForApi(birthDay, birthMonth, birthYear) : null,
                university: draftProfileData.university.trim() || null,
                study_direction: draftProfileData.direction.trim() || null,
                study_year: draftProfileData.course ? Number(draftProfileData.course) : null,
            });

            if (!isStaffProfile(updated)) {
                setSaveError("Не удалось сохранить профиль");
                return;
            }

            const mapped = mapStaffToTeacherProfile(updated);
            setProfileData(mapped);
            setDraftProfileData(mapped);
            const nextAvatar = updated.avatar_url ?? avatarSrc ?? TEACHER_DEFAULT_AVATAR_SRC;
            setAvatarSrc(nextAvatar);
            dispatchTeacherProfileUpdated({
                avatarUrl: nextAvatar,
                firstName: mapped.firstName,
                lastName: mapped.lastName,
                patronymic: mapped.patronymic,
                email: mapped.email,
            });
            setSaveNotice("Изменения сохранены");
            setIsEditing(false);
        } catch (error) {
            if (error instanceof AuthApiError) {
                setSaveError(error.message);
            } else {
                setSaveError("Не удалось сохранить профиль");
            }
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        try {
            if (accessToken || refreshToken) {
                await logout({ refresh_token: refreshToken }, accessToken);
            }
        } catch {
        } finally {
            clearAuthTokens();
            setIsLoggingOut(false);
            navigate({ to: "/login" });
        }
    };

    return {
        birthDateError,
        avatarSrc,
        profileData,
        draftProfileData,
        isEditing,
        startEditing,
        isProfileLoading,
        isProfileSaving,
        isAvatarUploading,
        isLoggingOut,
        profileError,
        saveNotice,
        saveError,
        handleFieldChange,
        handleBirthChange,
        uploadAvatarFile,
        handleAvatarChange,
        handleDeleteAvatar,
        saveProfile,
        handleLogout,
    };
}
