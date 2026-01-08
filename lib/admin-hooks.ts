import {
	deleteSubmission,
	getEndpointSummary,
	getSubmissionById,
	getSubmissions,
	getSubmissionsByEndpoint,
} from "@/app/admin/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for consistent cache management
export const queryKeys = {
	submissions: ["submissions"] as const,
	endpointSummary: ["endpoint-summary"] as const,
	submissionsByEndpoint: (endpoint: string) =>
		["submissions", endpoint] as const,
	submissionById: (id: string) => ["submission", id] as const,
};

// Hook for fetching all submissions
export function useSubmissions() {
	return useQuery({
		queryKey: queryKeys.submissions,
		queryFn: getSubmissions,
	});
}

// Hook for fetching endpoint summary
export function useEndpointSummary() {
	return useQuery({
		queryKey: queryKeys.endpointSummary,
		queryFn: getEndpointSummary,
	});
}

// Hook for fetching submissions by endpoint
export function useSubmissionsByEndpoint(endpoint: string) {
	return useQuery({
		queryKey: queryKeys.submissionsByEndpoint(endpoint),
		queryFn: () => getSubmissionsByEndpoint(endpoint),
		enabled: !!endpoint, // Only run if endpoint is provided
	});
}

// Hook for fetching a single submission by ID
export function useSubmissionById(id: string) {
	return useQuery({
		queryKey: queryKeys.submissionById(id),
		queryFn: () => getSubmissionById(id),
		enabled: !!id, // Only run if id is provided
	});
}

// Hook for deleting a submission
export function useDeleteSubmission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteSubmission,
		onSuccess: (_, deletedId) => {
			// Invalidate and refetch submissions queries
			queryClient.invalidateQueries({ queryKey: queryKeys.submissions });
			queryClient.invalidateQueries({ queryKey: queryKeys.endpointSummary });
			// Remove the specific submission from cache
			queryClient.removeQueries({
				queryKey: queryKeys.submissionById(deletedId),
			});
		},
	});
}
