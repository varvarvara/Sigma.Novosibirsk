import { useQuery } from "@tanstack/react-query";
import {
  getSeasonExtracurricularTeamMembers,
  getSeasonStaff,
  getSeasonStudents,
} from "../api/season.api";

export const seasonQueryKeys = {
  staff: (seasonId: number) => ["seasonStaff", seasonId] as const,
  students: (seasonId: number) => ["seasonStudents", seasonId] as const,
  teamMembers: (seasonId: number) => ["seasonExtracurricularTeamMembers", seasonId] as const,
};

export function useSeasonStaffQuery(seasonId: number) {
  return useQuery({
    queryKey: seasonQueryKeys.staff(seasonId),
    queryFn: () => getSeasonStaff(seasonId),
  });
}

export function useSeasonStudentsQuery(seasonId: number) {
  return useQuery({
    queryKey: seasonQueryKeys.students(seasonId),
    queryFn: () => getSeasonStudents(seasonId),
  });
}

export function useSeasonExtracurricularTeamMembersQuery(seasonId: number) {
  return useQuery({
    queryKey: seasonQueryKeys.teamMembers(seasonId),
    queryFn: () => getSeasonExtracurricularTeamMembers(seasonId),
  });
}
