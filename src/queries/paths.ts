import { useQuery } from "@tanstack/react-query";
import { pathService } from "@/services/pathService";
import { queryKeys } from "./keys";

export const usePaths = () => useQuery({ queryKey: queryKeys.paths.all, queryFn: pathService.list });

export const usePath = (id: string) =>
  useQuery({ queryKey: queryKeys.paths.detail(id), queryFn: () => pathService.detail(id), retry: false });
