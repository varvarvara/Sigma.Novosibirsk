import { useQuery } from "@tanstack/react-query";
import { getMyExtracurricular } from "../api/extracurricular.api";

export const extracurricularQueryKeys = {
    myExtracurricular: (seasonId: number) => ["myExtracurricular", seasonId] as const,
};

export function useMyExtracurricularQuery(seasonId = 1) {
    return useQuery({
        queryKey: extracurricularQueryKeys.myExtracurricular(seasonId),
        queryFn: () => getMyExtracurricular(seasonId),
    });
}
