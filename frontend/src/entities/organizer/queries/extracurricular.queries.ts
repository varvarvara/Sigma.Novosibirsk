import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    addExtracurricularTeamMember, 
    createExtracurricularActivity, 
    createExtracurricularTeam, 
    deleteExtracurricularTeam,
    listExtracurricularActivities, 
    listExtracurricularScores, 
    listExtracurricularTeamMembers, 
    listExtracurricularTeams, 
    markExtracurricularTeamAttendance,
    removeExtracurricularTeamMember,
    updateExtracurricularTeam,
} from "../api/extracurricular.api";
import { 
    ExtracurricularActivityCreate,
    ExtracurricularScoreCreate,
    ExtracurricularTeamCreate,
    ExtracurricularTeamMemberCreate,
    ExtracurricularTeamUpdate,
} from "../model/extracurricular.types";
import { seasonQueryKeys } from "./season.queries";

export const organizerExtracurricularQueryKeys = {
    activities: ["listExtracurricularActivities"] as const,
    teams: ["listExtracurricularTeams"] as const,
    members: (teamId: number, seasonId: number) =>
    ["listExtracurricularTeamMembers", teamId, seasonId] as const,
    scores: ["listExtracurricularScores"] as const,
}

export function useListActivitiesQuery() {
    return useQuery({
        queryKey: organizerExtracurricularQueryKeys.activities,
        queryFn: listExtracurricularActivities,
    });
}

export function useCreateActivityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ExtracurricularActivityCreate) => 
            createExtracurricularActivity(payload),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: organizerExtracurricularQueryKeys.activities
            }),
    });
}

export function useListTeamsQuery() {
    return useQuery({
        queryKey: organizerExtracurricularQueryKeys.teams,
        queryFn: listExtracurricularTeams,
    })
}

export function useCreateTeamMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ExtracurricularTeamCreate) =>
            createExtracurricularTeam(payload),
        onSuccess: async () => 
            await queryClient.invalidateQueries({
                queryKey: organizerExtracurricularQueryKeys.teams
            }),
    })
}

export function useUpdateTeamMutation(seasonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, payload }: { teamId: number; payload: ExtracurricularTeamUpdate }) =>
            updateExtracurricularTeam(teamId, payload),
        onSuccess: async () =>
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.teams
                }),
                queryClient.invalidateQueries({
                    queryKey: seasonQueryKeys.teamMembers(seasonId)
                }),
            ]),
    })
}

export function useDeleteTeamMutation(seasonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (teamId: number) => deleteExtracurricularTeam(teamId),
        onSuccess: async () =>
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.teams
                }),
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.scores
                }),
                queryClient.invalidateQueries({
                    queryKey: seasonQueryKeys.teamMembers(seasonId)
                }),
            ]),
    })
}

export function useCreateTeamMemberMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ExtracurricularTeamMemberCreate) =>
            addExtracurricularTeamMember(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: organizerExtracurricularQueryKeys.teams
            });
        }
    })
}

export function useAddTeamMemberMutation(teamId: number, seasonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ExtracurricularTeamMemberCreate) =>
            addExtracurricularTeamMember(payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.members(teamId, seasonId)
                }),
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.teams
                }),
            ]);
        }
    })
}

export function useRemoveTeamMemberMutation(seasonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, studentId }: { teamId: number; studentId: number }) =>
            removeExtracurricularTeamMember(teamId, studentId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.teams
                }),
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.scores
                }),
                queryClient.invalidateQueries({
                    queryKey: seasonQueryKeys.teamMembers(seasonId)
                }),
            ]);
        }
    })
}

export function useListTeamMembersQuery(teamId: number, seasonId: number) {
    return useQuery({
        queryKey: organizerExtracurricularQueryKeys.members(teamId, seasonId),
        queryFn: () => listExtracurricularTeamMembers(teamId, seasonId),
    })
}

export function useListScoresQuery() {
    return useQuery({
        queryKey: organizerExtracurricularQueryKeys.scores,
        queryFn: listExtracurricularScores,
    })
}

export function useMarkTeamAttendanceMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (payload: ExtracurricularScoreCreate) => 
            markExtracurricularTeamAttendance(payload),
        onSuccess: async () =>
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.scores
                }),
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.teams
                }),
                queryClient.invalidateQueries({
                    queryKey: organizerExtracurricularQueryKeys.activities
                }),
            ]),
    })
}
