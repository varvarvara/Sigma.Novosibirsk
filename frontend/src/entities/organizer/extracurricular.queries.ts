import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    addExtracurricularTeamMember, 
    createExtracurricularActivity, 
    createExtracurricularTeam, 
    listExtracurricularActivities, 
    listExtracurricularScores, 
    listExtracurricularTeamMembers, 
    listExtracurricularTeams, 
    markExtracurricularTeamAttendance 
} from "./api/extracurricular.api";
import { 
    ExtracurricularActivityCreate,
    ExtracurricularScoreCreate,
    ExtracurricularTeamCreate,
    ExtracurricularTeamMemberCreate,
} from "./model/extracurricular.types";

const extracurricullarQueryKeys = {
    activities: ["listExtracurricularActivities"] as const,
    teams: ["listExtracurricularTeams"] as const,
    members: (teamId: number, seasonId: number) =>
    ["listExtracurricularTeamMembers", teamId, seasonId] as const,
    scores: ["listExtracurricularScores"] as const,
}

export function useListActivitiesQuery() {
    return useQuery({
        queryKey: extracurricullarQueryKeys.activities,
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
                queryKey: extracurricullarQueryKeys.activities
            }),
    });
}

export function useListTeamsQuery() {
    return useQuery({
        queryKey: extracurricullarQueryKeys.teams,
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
                queryKey: extracurricullarQueryKeys.teams
            }),
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
                    queryKey: extracurricullarQueryKeys.members(teamId, seasonId)
                }),
                queryClient.invalidateQueries({
                    queryKey: extracurricullarQueryKeys.teams
                }),
            ]);
        }
    })
}

export function useListTeamMembersQuery(teamId: number, seasonId: number) {
    return useQuery({
        queryKey: extracurricullarQueryKeys.members(teamId, seasonId),
        queryFn: () => listExtracurricularTeamMembers(teamId, seasonId),
    })
}

export function useListScoresQuery() {
    return useQuery({
        queryKey: extracurricullarQueryKeys.scores,
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
                    queryKey: extracurricullarQueryKeys.scores
                }),
                queryClient.invalidateQueries({
                    queryKey: extracurricullarQueryKeys.teams
                }),
                queryClient.invalidateQueries({
                    queryKey: extracurricullarQueryKeys.activities
                }),
            ]),
    })
}