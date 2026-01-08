"use client";

import {
	AlertCircle,
	ArrowRight,
	Clock,
	Inbox,
	LayoutDashboard,
	LogOut,
	RefreshCw,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { getEndpointSummary } from "./actions";

interface EndpointSummary {
	endpoint_name: string;
	count: number;
	latest_submission_at: Date | null;
}

export default function AdminOverview() {
	const [endpoints, setEndpoints] = useState<EndpointSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();
	const [lastViewedTimestamps, setLastViewedTimestamps] = useState<
		Record<string, string>
	>({});
	const router = useRouter();

	const fetchEndpointSummary = useCallback(async () => {
		try {
			const data = await getEndpointSummary();
			const fetchedEndpoints = data as unknown as EndpointSummary[];
			setEndpoints(fetchedEndpoints);
			setError("");
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch endpoint summary";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchEndpointSummary();

		// Load last viewed timestamps from localStorage
		const stored = localStorage.getItem("admin_endpoint_last_viewed");
		if (stored) {
			try {
				setLastViewedTimestamps(JSON.parse(stored));
			} catch (err) {
				console.error("Failed to parse localStorage timestamps:", err);
			}
		}
	}, [fetchEndpointSummary]);

	const handleRefresh = () => {
		startTransition(async () => {
			await fetchEndpointSummary();
		});
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/admin/logout", { method: "POST" });
			router.push("/admin/login");
		} catch {
			router.push("/admin/login");
		}
	};

	const getNewSubmissionsCount = (
		endpoint: string,
		latestSubmissionAt: Date | null
	) => {
		if (!latestSubmissionAt) return 0;

		const lastViewed = lastViewedTimestamps[endpoint];
		if (!lastViewed) return 1; // If never viewed, consider all as new

		const lastViewedTime = new Date(lastViewed).getTime();
		const latestTime = new Date(latestSubmissionAt).getTime();

		return latestTime > lastViewedTime ? 1 : 0;
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "Never";
		return new Date(date).toLocaleString();
	};

	const stats = {
		totalSubmissions: endpoints.reduce((sum, ep) => sum + ep.count, 0),
		endpoints: endpoints.length,
		newLeads: endpoints.reduce(
			(sum, ep) =>
				sum + getNewSubmissionsCount(ep.endpoint_name, ep.latest_submission_at),
			0
		),
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
				<RefreshCw className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
				<p className="text-gray-600 dark:text-zinc-400 font-medium animate-pulse">
					Loading Overview...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12 transition-colors duration-300">
			{/* Header */}
			<div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
				<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-4">
						<div className="flex items-center gap-4">
							<div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-100 dark:shadow-none shadow-lg">
								<LayoutDashboard className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
									Admin Overview
								</h1>
								<p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
									FormBase Control Panel
								</p>
							</div>
							<button
								onClick={handleRefresh}
								disabled={isPending}
								className="ml-2 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 border border-indigo-100 dark:border-indigo-800"
							>
								<RefreshCw
									className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
								/>
								{isPending ? "Refreshing..." : "Refresh"}
							</button>
						</div>

						<div className="flex items-center gap-3">
							<ThemeToggle />
							<button
								onClick={handleLogout}
								className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900 text-gray-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition-all"
							>
								<LogOut className="w-4 h-4" />
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
					<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
							<Inbox className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
								Total Submissions
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.totalSubmissions}
							</p>
						</div>
					</div>
					<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
							<TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
								New Leads
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.newLeads}
							</p>
						</div>
					</div>
					<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
							<Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
								Endpoints
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.endpoints}
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl p-4 flex items-center gap-3">
						<AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
						<div className="text-sm font-medium text-red-700 dark:text-red-300">
							{error}
						</div>
					</div>
				)}

				{endpoints.length === 0 ? (
					<div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 py-20 px-4 flex flex-col items-center justify-center text-center">
						<div className="bg-gray-50 dark:bg-zinc-950 p-6 rounded-full mb-6">
							<Inbox className="w-16 h-16 text-gray-300 dark:text-zinc-700" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							No Endpoints Found
						</h3>
						<p className="text-gray-500 dark:text-zinc-400 max-w-sm">
							Waiting for your first form submissions to appear here.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{endpoints.map((endpoint) => {
							const newCount = getNewSubmissionsCount(
								endpoint.endpoint_name,
								endpoint.latest_submission_at
							);
							const hasNew = newCount > 0;

							return (
								<Link
									key={endpoint.endpoint_name}
									href={`/admin/${endpoint.endpoint_name}`}
									className={`group block bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 p-6 ${
										hasNew
											? "ring-2 ring-green-200 dark:ring-green-800 border-green-200 dark:border-green-800"
											: "hover:border-indigo-200 dark:hover:border-indigo-700"
									}`}
								>
									<div className="flex items-start justify-between mb-4">
										<div
											className={`p-3 rounded-xl transition-colors ${
												hasNew
													? "bg-green-50 dark:bg-green-900/30"
													: "bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50"
											}`}
										>
											<Zap
												className={`w-6 h-6 ${
													hasNew
														? "text-green-600 dark:text-green-400"
														: "text-indigo-600 dark:text-indigo-400"
												}`}
											/>
										</div>
										{hasNew && (
											<div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
												NEW
											</div>
										)}
									</div>

									<div className="space-y-3">
										<h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
											{endpoint.endpoint_name}
										</h3>

										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
												Submissions
											</span>
											<span className="text-xl font-bold text-gray-900 dark:text-white">
												{endpoint.count}
											</span>
										</div>

										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
												Last Activity
											</span>
											<div className="flex items-center gap-1 text-xs text-gray-600 dark:text-zinc-300">
												<Clock className="w-3 h-3" />
												<span>{formatDate(endpoint.latest_submission_at)}</span>
											</div>
										</div>

										<div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
													View Details
												</span>
												<ArrowRight className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
											</div>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
