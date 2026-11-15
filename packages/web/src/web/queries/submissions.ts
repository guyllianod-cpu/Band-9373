import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
export function useRuntimeConfig() {
  return useQuery(orpc.submissions.configuration.queryOptions({ staleTime: 60_000, retry: 1 }));
}
export function useSubmitProject() {
  return useMutation(orpc.submissions.project.mutationOptions());
}
export function useSubmitContact() {
  return useMutation(orpc.submissions.contact.mutationOptions());
}
