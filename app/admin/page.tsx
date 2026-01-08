"use client";

import {
	AlertCircle,
	ChevronDown,
	Eye,
	EyeOff,
	Inbox,
	Layers,
	LayoutDashboard,
	LogOut,
	RefreshCw,
	Search,
	Trash2,
	Users,
	Zap,
} from "lucide-react";
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
	const [searchQuery, setSearchQuery] = useState("");
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

	// Group submissions by endpoint_name and apply filters
	const filteredSubmissions = submissions.filter((sub) => {
		if (sub.endpoint_name !== endpointFilter) return false;
		if (!searchQuery) return true;

		const searchLower = searchQuery.toLowerCase();
		// Search in data
		const inData = Object.values(sub.data).some((val) =>
			String(val).toLowerCase().includes(searchLower)
		);
		// Search in browser info if visible
		const inBrowser =
			showBrowserInfo &&
			Object.values(sub.browser_info).some((val) =>
				String(val).toLowerCase().includes(searchLower)
			);
		// Search in IP or date
		const inMeta =
			(sub.ip_address?.toLowerCase().includes(searchLower) ?? false) ||
			formatDate(sub.created_at).toLowerCase().includes(searchLower);

		return inData || inBrowser || inMeta;
	});

	const groupedSubmissions =
		filteredSubmissions.length > 0
			? { [endpointFilter]: filteredSubmissions }
			: {};

	const stats = {
		total: submissions.length,
		current: filteredSubmissions.length,
		endpoints: uniqueEndpoints.length,
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
				<RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
				<p className="text-gray-600 font-medium animate-pulse">
					Loading Dashboard...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pb-12">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
				<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
						<div className="flex items-center gap-4">
							<div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-100 shadow-lg">
								<LayoutDashboard className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900 leading-tight">
									Admin Dashboard
								</h1>
								<p className="text-xs text-gray-500 font-medium">
									Any-Form Control Panel
								</p>
							</div>
							<button
								onClick={handleRefresh}
								disabled={isPending}
								className="ml-2 flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 border border-indigo-100"
							>
								<RefreshCw
									className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
								/>
								{isPending ? "Refreshing..." : "Refresh"}
							</button>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<div className="relative flex-1 md:flex-none min-w-[200px]">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-4 w-4 text-gray-400" />
								</div>
								<input
									type="text"
									placeholder="Search submissions..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
								/>
							</div>

							<div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
								<button
									onClick={() => setShowBrowserInfo(!showBrowserInfo)}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
										showBrowserInfo
											? "bg-white text-indigo-600 shadow-sm"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									{showBrowserInfo ? (
										<>
											<EyeOff className="w-3.5 h-3.5" />
											Hide Browser
										</>
									) : (
										<>
											<Eye className="w-3.5 h-3.5" />
											Show Browser
										</>
									)}
								</button>
							</div>

							<div className="relative">
								<select
									value={endpointFilter}
									onChange={(e) => setEndpointFilter(e.target.value)}
									className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer font-medium"
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
								<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
									<ChevronDown className="h-4 w-4" />
								</div>
							</div>

							<button
								onClick={handleLogout}
								className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
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
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
							<Users className="w-6 h-6 text-indigo-600" />
						</div>
						<div>
							<p className="text-sm text-gray-500 font-medium">
								Total Submissions
							</p>
							<p className="text-2xl font-bold text-gray-900">{stats.total}</p>
						</div>
					</div>
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
							<Zap className="w-6 h-6 text-green-600" />
						</div>
						<div>
							<p className="text-sm text-gray-500 font-medium">
								Visible Results
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.current}
							</p>
						</div>
					</div>
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-amber-50 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
							<Layers className="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<p className="text-sm text-gray-500 font-medium">Endpoints</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.endpoints}
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
						<AlertCircle className="w-5 h-5 text-red-500" />
						<div className="text-sm font-medium text-red-700">{error}</div>
					</div>
				)}

				{Object.keys(groupedSubmissions).length === 0 ? (
					<div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 px-4 flex flex-col items-center justify-center text-center">
						<div className="bg-gray-50 p-6 rounded-full mb-6">
							<Inbox className="w-16 h-16 text-gray-300" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							No Submissions Found
						</h3>
						<p className="text-gray-500 max-w-sm mb-8">
							{searchQuery
								? `We couldn't find anything matching "${searchQuery}" in this endpoint.`
								: "Waiting for your first form submission for this endpoint."}
						</p>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors px-4 py-2 bg-indigo-50 rounded-lg"
							>
								Clear Search
							</button>
						)}
					</div>
				) : (
					<div className="space-y-8">
						{Object.entries(groupedSubmissions).map(([endpoint, subs]) => {
							const dataKeys = Array.from(
								new Set(subs.flatMap((s) => Object.keys(s.data || {})))
							);
							const browserKeys = Array.from(
								new Set(subs.flatMap((s) => Object.keys(s.browser_info || {})))
							);

							return (
								<div key={endpoint} className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
											<h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
												Endpoint:{" "}
												<span className="text-indigo-600 uppercase">
													{endpoint}
												</span>
											</h2>
											<span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
												{subs.length} items
											</span>
										</div>
									</div>

									<div className="bg-white shadow-xl shadow-gray-200/50 border border-gray-100 rounded-3xl overflow-hidden transition-all">
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-100 border-collapse">
												<thead className="bg-gray-50/50">
													<tr>
														<th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50/90 backdrop-blur-sm z-20 border-r border-gray-100/50 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
															Timestamp
														</th>
														{dataKeys.map((key) => (
															<th
																key={`data-${key}`}
																className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest border-r border-gray-100/30"
															>
																{key}
															</th>
														))}
														{showBrowserInfo &&
															browserKeys.map((key) => (
																<th
																	key={`browser-${key}`}
																	className="px-6 py-4 text-left text-xs font-bold text-indigo-400 uppercase tracking-widest italic bg-indigo-50/30 border-r border-gray-100/30"
																>
																	{key}
																</th>
															))}
														<th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest sticky right-0 bg-gray-50/90 backdrop-blur-sm z-20 border-l border-gray-100 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">
															Actions
														</th>
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-50">
													{subs.map((sub) => (
														<tr
															key={sub.id}
															className="group hover:bg-indigo-50/30 transition-all duration-200"
														>
															<td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-gray-500 sticky left-0 bg-white group-hover:bg-indigo-50/50 transition-colors z-10 border-r border-gray-100/50 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
																<div className="flex flex-col">
																	<span>
																		{new Date(
																			sub.created_at
																		).toLocaleDateString()}
																	</span>
																	<span className="text-[10px] text-gray-400">
																		{new Date(
																			sub.created_at
																		).toLocaleTimeString()}
																	</span>
																</div>
															</td>
															{dataKeys.map((key) => (
																<td
																	key={`${sub.id}-data-${key}`}
																	className="px-6 py-5 text-sm text-gray-700 font-medium border-r border-gray-100/30 max-w-[300px] truncate"
																	title={String(sub.data[key])}
																>
																	{sub.data[key] !== null &&
																	sub.data[key] !== undefined ? (
																		typeof sub.data[key] === "object" ? (
																			<code className="text-xs bg-gray-50 p-1 rounded font-mono truncate block">
																				{JSON.stringify(sub.data[key])}
																			</code>
																		) : (
																			String(sub.data[key])
																		)
																	) : (
																		<span className="text-gray-300">—</span>
																	)}
																</td>
															))}
															{showBrowserInfo &&
																browserKeys.map((key) => (
																	<td
																		key={`${sub.id}-browser-${key}`}
																		className="px-6 py-5 text-xs text-indigo-500 bg-indigo-50/10 group-hover:bg-indigo-50/30 transition-colors border-r border-gray-100/30 max-w-[200px] truncate"
																		title={String(sub.browser_info[key])}
																	>
																		{sub.browser_info[key] !== null &&
																		sub.browser_info[key] !== undefined ? (
																			String(sub.browser_info[key])
																		) : (
																			<span className="text-indigo-200">—</span>
																		)}
																	</td>
																))}
															<td className="px-6 py-5 whitespace-nowrap sticky right-0 bg-white group-hover:bg-indigo-50/50 transition-colors z-10 border-l border-gray-100 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">
																<div className="flex items-center gap-3">
																	{sub.ip_address && (
																		<span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono font-bold">
																			{sub.ip_address}
																		</span>
																	)}
																	<button
																		onClick={() => handleDelete(sub.id)}
																		className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
																		title="Delete entry"
																	>
																		<Trash2 className="w-5 h-5" />
																	</button>
																</div>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
										<div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
											<span>
												Showing {subs.length} of {stats.total} total submissions
											</span>
											<span>End of data for {endpoint}</span>
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
