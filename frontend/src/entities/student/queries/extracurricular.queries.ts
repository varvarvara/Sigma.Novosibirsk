import { getMyExtracurricular } from "../api/extracurricular.api";
import { useQuery } from "@tanstack/react-query";

export function useMyExtracurricularQuery(seasonId = 1) {
    return useQuery({
        queryKey: ["myExtracurricular", seasonId],
        queryFn: () => getMyExtracurricular(seasonId),
    });
}