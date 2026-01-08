"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { deleteSubmission, getSubmissions } from "./actions";

interface Submission {
	id: string;
	endpoint_name: string;
	data: Record<string, unknown>;
	browser_info: Record<string, unknown>;
	created_at: Date;
	ip_address: string | null;
}

export default function AdminDashboard() {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();
	const [endpointFilter, setEndpointFilter] = useState<string>("");
	const [showBrowserInfo, setShowBrowserInfo] = useState(false);
	const router = useRouter();

	const fetchSubmissionsData = useCallback(async () => {
		try {
			const data = await getSubmissions();
			const fetchedSubmissions = data as unknown as Submission[];
			setSubmissions(fetchedSubmissions);

			// Set initial filter to first endpoint if not set
			setEndpointFilter((prev) => {
				if (fetchedSubmissions.length > 0 && !prev) {
					const unique = Array.from(
						new Set(fetchedSubmissions.map((s) => s.endpoint_name))
					).sort();
					return unique.length > 0 ? unique[0] : prev;
				}
				return prev;
			});
			setError("");
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch submissions";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSubmissionsData();
	}, [fetchSubmissionsData]);

	const handleRefresh = () => {
		startTransition(async () => {
			await fetchSubmissionsData();
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

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this submission?")) return;
		try {
			await deleteSubmission(id);
			await fetchSubmissionsData();
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to delete submission";
			alert(message);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString();
	};

	// Get unique endpoints for the filter
	const uniqueEndpoints = Array.from(
		new Set(submissions.map((s) => s.endpoint_name))
	).sort();

	// Group submissions by endpoint_name and apply filter
	const groupedSubmissions = submissions.reduce((acc, sub) => {
		if (sub.endpoint_name !== endpointFilter) {
			return acc;
		}
		if (!acc[sub.endpoint_name]) {
			acc[sub.endpoint_name] = [];
		}
		acc[sub.endpoint_name].push(sub);
		return acc;
	}, {} as Record<string, Submission[]>);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg animate-pulse">Loading dashboard...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pb-12">
			{/* Header */}
			<div className="bg-white shadow-sm sticky top-0 z-10">
				<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center gap-4">
							<h1 className="text-xl font-bold text-gray-900">
								Admin Dashboard
							</h1>
							<button
								onClick={handleRefresh}
								disabled={isPending}
								className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
							>
								{isPending ? "Refreshing..." : "Refresh"}
							</button>
						</div>
						<div className="flex items-center gap-4">
							<button
								onClick={() => setShowBrowserInfo(!showBrowserInfo)}
								className={`px-3 py-1 w-full bg-gray-100 rounded-md text-xs font-medium transition-all ${
									showBrowserInfo
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								{showBrowserInfo ? "Hide Browser Info" : "Show Browser Info"}
							</button>
							<select
								value={endpointFilter}
								onChange={(e) => setEndpointFilter(e.target.value)}
								className="block w-full max-w-xs px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								{uniqueEndpoints.length === 0 && (
									<option value="">No Endpoints</option>
								)}
								{uniqueEndpoints.map((endpoint) => (
									<option key={endpoint} value={endpoint}>
										{endpoint}
									</option>
								))}
							</select>
							<button
								onClick={handleLogout}
								className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
						<div className="text-sm text-red-700">{error}</div>
					</div>
				)}

				{Object.keys(groupedSubmissions).length === 0 ? (
					<div className="text-center py-12 bg-white rounded-lg shadow-sm">
						<p className="text-gray-500">No submissions found yet.</p>
					</div>
				) : (
					<div className="space-y-12">
						{Object.entries(groupedSubmissions).map(([endpoint, subs]) => {
							const dataKeys = Array.from(
								new Set(subs.flatMap((s) => Object.keys(s.data || {})))
							);
							const browserKeys = Array.from(
								new Set(subs.flatMap((s) => Object.keys(s.browser_info || {})))
							);

							return (
								<div key={endpoint} className="space-y-4">
									<div className="flex items-baseline gap-2">
										<h2 className="text-lg font-bold text-gray-800">
											Endpoint:{" "}
											<span className="text-indigo-600">{endpoint}</span>
										</h2>
										<span className="text-sm text-gray-500">
											({subs.length} submissions)
										</span>
									</div>

									<div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-200">
												<thead className="bg-gray-50">
													<tr>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
															Date
														</th>
														{dataKeys.map((key) => (
															<th
																key={`data-${key}`}
																className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
															>
																{key}
															</th>
														))}
														{showBrowserInfo &&
															browserKeys.map((key) => (
																<th
																	key={`browser-${key}`}
																	className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider italic"
																>
																	{key}
																</th>
															))}
														<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
															Actions
														</th>
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-200">
													{subs.map((sub) => (
														<tr
															key={sub.id}
															className="hover:bg-gray-50 transition-colors"
														>
															<td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
																{formatDate(sub.created_at)}
															</td>
															{dataKeys.map((key) => (
																<td
																	key={`${sub.id}-data-${key}`}
																	className="px-4 py-3 text-sm text-gray-900"
																>
																	{typeof sub.data[key] === "object"
																		? JSON.stringify(sub.data[key])
																		: String(sub.data[key] ?? "-")}
																</td>
															))}
															{showBrowserInfo &&
																browserKeys.map((key) => (
																	<td
																		key={`${sub.id}-browser-${key}`}
																		className="px-4 py-3 text-xs text-gray-500"
																	>
																		{typeof sub.browser_info[key] === "object"
																			? JSON.stringify(sub.browser_info[key])
																			: String(sub.browser_info[key] ?? "-")}
																	</td>
																))}
															<td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
																<button
																	onClick={() => handleDelete(sub.id)}
																	className="text-red-600 hover:text-red-900 transition-colors"
																>
																	Delete
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
