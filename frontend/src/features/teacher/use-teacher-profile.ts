import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AuthApiError, clearAuthTokens, getAccessToken, getRefreshToken, logout } from '../../entities/auth';
import {
  deleteMyAvatar,
  getCurrentStudent,
  isStaffProfile,
  updateMyStaffProfile,
  uploadMyAvatar,
} from '../../entities/student/api/profile.api';
import { validateBirthDate } from '../auth/birth-date-validation';
import { dispatchTeacherProfileUpdated } from '../../shared/teacher-profile-events';
import {
  formatTeacherBirthDateForApi,
  mapStaffToTeacherProfile,
  TEACHER_AVATAR_MAX_SIZE_BYTES,
  TEACHER_DEFAULT_AVATAR_SRC,
  type TeacherProfileData,
  emptyTeacherProfileData,
} from './teacher-profile';

export function useTeacherProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(TEACHER_DEFAULT_AVATAR_SRC);
  const [profileData, setProfileData] = useState<TeacherProfileData>(emptyTeacherProfileData);
  const [draftProfileData, setDraftProfileData] = useState<TeacherProfileData>(emptyTeacherProfileData);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate({ to: '/login' });
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const user = await getCurrentStudent();
      if (!isStaffProfile(user)) {
        setProfileError('Эта страница доступна только преподавателям');
        return;
      }

      if (user.staff_role === 'Admin') {
        navigate({ to: '/org-extracurricular' });
        return;
      }

      const mapped = mapStaffToTeacherProfile(user);
      setProfileData(mapped);
      setDraftProfileData(mapped);
      const nextAvatar = user.avatar_url ?? TEACHER_DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchTeacherProfileUpdated({
        avatarUrl: nextAvatar,
        firstName: mapped.firstName,
        lastName: mapped.lastName,
        patronymic: mapped.patronymic,
        email: mapped.email,
      });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        clearAuthTokens();
        navigate({ to: '/login' });
        return;
      }

      setProfileError('Не удалось загрузить профиль');
    } finally {
      setIsProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    setDraftProfileData(profileData);
    setBirthDateError(null);
    setSaveError(null);
    setSaveNotice(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftProfileData(profileData);
    setBirthDateError(null);
    setSaveError(null);
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof TeacherProfileData, value: string) => {
    if (!isEditing) {
      return;
    }
    setDraftProfileData((current) => ({ ...current, [field]: value }));
    setSaveNotice(null);
    setSaveError(null);
  };

  const handleBirthChange = (field: 'birthDay' | 'birthMonth' | 'birthYear', value: string) => {
    const digits = value.replace(/\D/g, '');
    const maxLength = field === 'birthYear' ? 4 : 2;
    const nextValue = digits.slice(0, maxLength);

    if (field === 'birthDay' && nextValue.length === 2) {
      const day = Number(nextValue);
      if (day < 1 || day > 31) {
        return;
      }
    }

    if (field === 'birthMonth' && nextValue.length === 2) {
      const month = Number(nextValue);
      if (month < 1 || month > 12) {
        return;
      }
    }

    handleFieldChange(field, nextValue);
    setBirthDateError(null);
  };

  const uploadAvatarFile = async (selectedFile: File) => {
    if (!isEditing) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      alert('Нужно выбрать файл изображения.');
      return;
    }

    if (selectedFile.size > TEACHER_AVATAR_MAX_SIZE_BYTES) {
      alert('Максимальный размер аватара: 5 МБ.');
      return;
    }

    setIsAvatarUploading(true);

    try {
      const uploaded = await uploadMyAvatar(selectedFile);
      const nextAvatar = uploaded.avatar_url || TEACHER_DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchTeacherProfileUpdated({ avatarUrl: nextAvatar });
      setSaveNotice('Аватар обновлён');
      setSaveError(null);
    } catch (error) {
      if (error instanceof AuthApiError) {
        alert(error.message);
      } else {
        alert('Не удалось загрузить аватар.');
      }
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    await uploadAvatarFile(selectedFile);
    event.target.value = '';
  };

  const handleDeleteAvatar = async () => {
    if (!isEditing) {
      return;
    }

    setIsAvatarUploading(true);

    try {
      const user = await deleteMyAvatar();
      const nextAvatar = isStaffProfile(user) ? user.avatar_url ?? TEACHER_DEFAULT_AVATAR_SRC : TEACHER_DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchTeacherProfileUpdated({ avatarUrl: nextAvatar });
      setSaveNotice('Аватар удалён');
      setSaveError(null);
    } catch (error) {
      if (error instanceof AuthApiError) {
        alert(error.message);
      } else {
        alert('Не удалось удалить аватар.');
      }
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const saveProfile = async (): Promise<boolean> => {
    const firstName = draftProfileData.firstName.trim();
    const lastName = draftProfileData.lastName.trim();

    if (!firstName || !lastName) {
      setSaveError('Укажите имя и фамилию');
      return false;
    }

    const { birthDay, birthMonth, birthYear } = draftProfileData;
    const hasBirthInput = Boolean(birthDay || birthMonth || birthYear);

    if (hasBirthInput) {
      const birthError = validateBirthDate(birthDay, birthMonth, birthYear);
      if (birthError) {
        setBirthDateError(birthError);
        return false;
      }
    }

    const studyYear = draftProfileData.course.trim() ? Number(draftProfileData.course) : null;
    if (studyYear !== null && (!Number.isInteger(studyYear) || studyYear < 1 || studyYear > 6)) {
      setSaveError('Курс обучения должен быть от 1 до 6');
      return false;
    }

    setBirthDateError(null);
    setIsProfileSaving(true);
    setSaveError(null);
    setSaveNotice(null);

    try {
      const updated = await updateMyStaffProfile({
        first_name: firstName,
        last_name: lastName,
        partonymic: draftProfileData.patronymic.trim() || null,
        birth_date: hasBirthInput ? formatTeacherBirthDateForApi(birthDay, birthMonth, birthYear) : null,
        university: draftProfileData.university.trim() || null,
        study_direction: draftProfileData.direction.trim() || null,
        study_year: studyYear,
      });

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
      setSaveNotice('Изменения сохранены');
      setIsEditing(false);
      return true;
    } catch (error) {
      if (error instanceof AuthApiError) {
        setSaveError(error.message);
      } else {
        setSaveError('Не удалось сохранить профиль');
      }
      return false;
    } finally {
      setIsProfileSaving(false);
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
      // Logout continues locally even if the request fails.
    } finally {
      clearAuthTokens();
      setIsLoggingOut(false);
      navigate({ to: '/login' });
    }
  };

  return {
    birthDateError,
    avatarSrc,
    profileData,
    draftProfileData,
    isEditing,
    startEditing,
    cancelEditing,
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
    reloadProfile: loadProfile,
  };
}
