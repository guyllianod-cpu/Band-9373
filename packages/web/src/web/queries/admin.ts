import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
export function useAdminProfile() {
  return useQuery(orpc.admin.profile.queryOptions({ retry: false }));
}
export function useAdminList(kind: "project" | "contact", status: string, page: number) {
  return useQuery(orpc.admin.list.queryOptions({ input: { kind, status, page }, retry: false }));
}
export function useAdminDetail(kind: "project" | "contact", id: string) {
  return useQuery(
    orpc.admin.detail.queryOptions({ input: { kind, id }, enabled: !!id, retry: false }),
  );
}
export function useAdminUpdate() {
  const qc = useQueryClient();
  return useMutation(
    orpc.admin.update.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.admin.key() }),
    }),
  );
}
export function useRetryNotification() {
  const qc = useQueryClient();
  return useMutation(
    orpc.admin.retryNotification.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.admin.key() }),
    }),
  );
}
