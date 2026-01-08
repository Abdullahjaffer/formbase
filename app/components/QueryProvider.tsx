"use client";

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// With SSR, we usually want to set some default staleTime
						// above 0 to avoid refetching immediately on the client
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
					},
				},
			})
	);

	return (
		<TanStackQueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</TanStackQueryClientProvider>
	);
}
