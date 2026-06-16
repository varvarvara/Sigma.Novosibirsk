import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteMyAvatar,
    getCurrentStudent,
    getStudentGamification,
    getStudentTeam,
    updateMyStaffProfile,
    updateMyStudentProfile,
    uploadMyAvatar
} from "../api/profile.api"

import type {
    StaffMeUpdate,
    StudentMeUpdate,
} from "../model/profile.types"

export const studentQueryKeys = {
    currentStudent: ["currentUser"] as const,
    studentGamification: 
        (studentId: number) => ["studentGamification", studentId] as const,
    studentTeam: 
        (studentId: number) => ["studentTeam", studentId] as const,
}


export function useCurrentUserQuery() {
    return useQuery({
        queryKey: studentQueryKeys.currentStudent,
        queryFn: getCurrentStudent,
    })
}

export function useStudentGamificationQuery(studentId: number) {
    return useQuery({
        queryKey: studentQueryKeys.studentGamification(studentId),
        queryFn: () => getStudentGamification(studentId as number),
    })
}

export function useStudentTeamQuery(studentId: number) {
    return useQuery({
        queryKey: studentQueryKeys.studentTeam(studentId),
        queryFn: () => getStudentTeam(studentId),
    })
}

export function useUpdateMyStudentProfileMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: StudentMeUpdate) => updateMyStudentProfile(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: studentQueryKeys.currentStudent});
        },
    });
}

export function useUpdateMyAvatarMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => uploadMyAvatar(file),
        onSuccess: async() => {
            await queryClient.invalidateQueries({queryKey: studentQueryKeys.currentStudent});
        },
    });
}

export function useDeleteMyAvatarMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteMyAvatar(),
        onSuccess: async() => {
            await queryClient.invalidateQueries({queryKey: studentQueryKeys.currentStudent});
        },
    });
}

export function useUpdateMyStaffProfileMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: StaffMeUpdate) => updateMyStaffProfile(payload),
        onSuccess: async() => {
            await queryClient.invalidateQueries({queryKey: studentQueryKeys.currentStudent});
        },
    });
}