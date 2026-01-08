"use client";

import {
	AlertCircle,
	ArrowLeft,
	Copy,
	Eye,
	EyeOff,
	Inbox,
	LayoutDashboard,
	LogOut,
	RefreshCw,
	Search,
	Trash2,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { deleteSubmission, getSubmissionsByEndpoint } from "../actions";

interface Submission {
	id: string;
	endpoint_name: string;
	data: Record<string, unknown>;
	browser_info: Record<string, unknown>;
	created_at: Date;
	ip_address: string | null;
}

export default function AdminEndpointDashboard() {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();
	const [showBrowserInfo, setShowBrowserInfo] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();
	const params = useParams();
	const endpoint = params.endpoint as string;

	const fetchSubmissionsData = useCallback(async () => {
		try {
			const data = await getSubmissionsByEndpoint(endpoint);
			const fetchedSubmissions = data as unknown as Submission[];
			setSubmissions(fetchedSubmissions);
			setError("");
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch submissions";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [endpoint]);

	useEffect(() => {
		fetchSubmissionsData();

		// Update localStorage timestamp for this endpoint
		const stored = localStorage.getItem("admin_endpoint_last_viewed");
		let timestamps: Record<string, string> = {};
		if (stored) {
			try {
				timestamps = JSON.parse(stored);
			} catch (err) {
				console.error("Failed to parse localStorage timestamps:", err);
			}
		}
		timestamps[endpoint] = new Date().toISOString();
		localStorage.setItem(
			"admin_endpoint_last_viewed",
			JSON.stringify(timestamps)
		);
	}, [fetchSubmissionsData, endpoint]);

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

	const handleCopyUrl = async () => {
		const url = `${window.location.origin}/api/${endpoint}`;
		try {
			await navigator.clipboard.writeText(url);
			// You could add a toast notification here if desired
		} catch (err) {
			console.error("Failed to copy URL:", err);
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = url;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString();
	};

	// Filter submissions based on search query
	const filteredSubmissions = submissions.filter((sub) => {
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

	const stats = {
		total: submissions.length,
		current: filteredSubmissions.length,
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
				<RefreshCw className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
				<p className="text-gray-600 dark:text-zinc-400 font-medium animate-pulse">
					Loading Submissions...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12 transition-colors duration-300">
			{/* Header */}
			<div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
				<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
						<div className="flex items-center gap-4">
							<Link
								href="/admin"
								className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								<span className="text-sm font-medium">Back to Overview</span>
							</Link>
							<div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-100 dark:shadow-none shadow-lg">
								<LayoutDashboard className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
									Endpoint: {endpoint}
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
									className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
								/>
							</div>

							<div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700">
								<button
									onClick={() => setShowBrowserInfo(!showBrowserInfo)}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
										showBrowserInfo
											? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
											: "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
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
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
					<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
							<Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
								Total Submissions
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.total}
							</p>
						</div>
					</div>
					<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 group hover:shadow-md transition-shadow">
						<div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
							<Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
								Visible Results
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.current}
							</p>
						</div>
					</div>
				</div>

				{/* Form URL Section */}
				<div className="mb-8">
					<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
								Form URL:
							</span>
							<div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 flex-1">
								<code className="text-xs font-mono text-gray-700 dark:text-zinc-300 flex-1">
									{`${window.location.origin}/api/${endpoint}`}
								</code>
								<button
									onClick={handleCopyUrl}
									className="p-1 text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all"
									title="Copy URL to clipboard"
								>
									<Copy className="w-3.5 h-3.5" />
								</button>
							</div>
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

				{filteredSubmissions.length === 0 ? (
					<div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 py-20 px-4 flex flex-col items-center justify-center text-center">
						<div className="bg-gray-50 dark:bg-zinc-950 p-6 rounded-full mb-6">
							<Inbox className="w-16 h-16 text-gray-300 dark:text-zinc-700" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							No Submissions Found
						</h3>
						<p className="text-gray-500 dark:text-zinc-400 max-w-sm mb-8">
							{searchQuery
								? `We couldn't find anything matching "${searchQuery}" in this endpoint.`
								: "Waiting for your first form submission for this endpoint."}
						</p>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"
							>
								Clear Search
							</button>
						)}
					</div>
				) : (
					<div className="bg-white dark:bg-zinc-900 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800 border-collapse">
								<thead className="bg-gray-50/50 dark:bg-zinc-950/50">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest sticky left-0 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 border-r border-gray-100/50 dark:border-zinc-800/50 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
											Timestamp
										</th>
										{(() => {
											const dataKeys = Array.from(
												new Set(
													filteredSubmissions.flatMap((s) =>
														Object.keys(s.data || {})
													)
												)
											);
											const browserKeys = Array.from(
												new Set(
													filteredSubmissions.flatMap((s) =>
														Object.keys(s.browser_info || {})
													)
												)
											);

											return (
												<>
													{dataKeys.map((key) => (
														<th
															key={`data-${key}`}
															className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-zinc-300 uppercase tracking-widest border-r border-gray-100/30 dark:border-zinc-800/30"
														>
															{key}
														</th>
													))}
													{showBrowserInfo &&
														browserKeys.map((key) => (
															<th
																key={`browser-${key}`}
																className="px-6 py-4 text-left text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-widest italic bg-indigo-50/30 dark:bg-indigo-900/10 border-r border-gray-100/30 dark:border-zinc-800/30"
															>
																{key}
															</th>
														))}
													<th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest sticky right-0 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 border-l border-gray-100 dark:border-zinc-800 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">
														Actions
													</th>
												</>
											);
										})()}
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-50 dark:divide-zinc-800">
									{(() => {
										const dataKeys = Array.from(
											new Set(
												filteredSubmissions.flatMap((s) =>
													Object.keys(s.data || {})
												)
											)
										);
										const browserKeys = Array.from(
											new Set(
												filteredSubmissions.flatMap((s) =>
													Object.keys(s.browser_info || {})
												)
											)
										);

										return filteredSubmissions.map((sub) => (
											<tr
												key={sub.id}
												className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-200"
											>
												<td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-zinc-400 sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors z-10 border-r border-gray-100/50 dark:border-zinc-800/50 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
													<div className="flex flex-col">
														<span>
															{new Date(sub.created_at).toLocaleDateString()}
														</span>
														<span className="text-[10px] text-gray-400 dark:text-zinc-500">
															{new Date(sub.created_at).toLocaleTimeString()}
														</span>
													</div>
												</td>
												{dataKeys.map((key) => (
													<td
														key={`${sub.id}-data-${key}`}
														className="px-6 py-5 text-sm text-gray-700 dark:text-zinc-300 font-medium border-r border-gray-100/30 dark:border-zinc-800/30 max-w-[300px] truncate"
														title={String(sub.data[key])}
													>
														{sub.data[key] !== null &&
														sub.data[key] !== undefined ? (
															typeof sub.data[key] === "object" ? (
																<code className="text-xs bg-gray-50 dark:bg-zinc-800 p-1 rounded font-mono truncate block text-gray-600 dark:text-zinc-400">
																	{JSON.stringify(sub.data[key])}
																</code>
															) : (
																String(sub.data[key])
															)
														) : (
															<span className="text-gray-300 dark:text-zinc-700">
																—
															</span>
														)}
													</td>
												))}
												{showBrowserInfo &&
													browserKeys.map((key) => (
														<td
															key={`${sub.id}-browser-${key}`}
															className="px-6 py-5 text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-50/10 dark:bg-indigo-900/5 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors border-r border-gray-100/30 dark:border-zinc-800/30 max-w-[200px] truncate"
															title={String(sub.browser_info[key])}
														>
															{sub.browser_info[key] !== null &&
															sub.browser_info[key] !== undefined ? (
																String(sub.browser_info[key])
															) : (
																<span className="text-indigo-200 dark:text-indigo-900">
																	—
																</span>
															)}
														</td>
													))}
												<td className="px-6 py-5 whitespace-nowrap sticky right-0 bg-white dark:bg-zinc-900 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors z-10 border-l border-gray-100 dark:border-zinc-800 shadow-[-1px_0_0_rgba(0,0,0,0.05)]">
													<div className="flex items-center gap-3">
														{sub.ip_address && (
															<span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono font-bold">
																{sub.ip_address}
															</span>
														)}
														<Link
															href={`/admin/${endpoint}/${sub.id}`}
															className="p-2 text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
															title="View details"
														>
															<Eye className="w-5 h-5" />
														</Link>
														<button
															onClick={() => handleDelete(sub.id)}
															className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
															title="Delete entry"
														>
															<Trash2 className="w-5 h-5" />
														</button>
													</div>
												</td>
											</tr>
										));
									})()}
								</tbody>
							</table>
						</div>
						<div className="bg-gray-50/80 dark:bg-zinc-950/80 px-6 py-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
							<span>
								Showing {filteredSubmissions.length} of {stats.total} total
								submissions
							</span>
							<span>End of data for {endpoint}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
