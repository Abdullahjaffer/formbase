"use client";

import { useDeleteSubmission, useSubmissionById } from "@/lib/admin-hooks";
import {
	ArrowLeft,
	Calendar,
	Database,
	Globe,
	LayoutDashboard,
	Loader2,
	LogOut,
	Monitor,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ThemeToggle } from "../../../components/ThemeToggle";

export default function SubmissionDetailPage() {
	const router = useRouter();
	const params = useParams();
	const endpoint = params.endpoint as string;
	const id = params.id as string;

	const { data: submission, isLoading: loading, error } = useSubmissionById(id);
	const deleteMutation = useDeleteSubmission();

	const handleLogout = async () => {
		try {
			await fetch("/api/admin/logout", { method: "POST" });
			router.push("/admin/login");
		} catch {
			router.push("/admin/login");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this submission?")) return;
		try {
			await deleteMutation.mutateAsync(id);
			router.push(`/admin/${endpoint}`);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to delete submission";
			alert(message);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString();
	};

	const renderValue = (value: unknown) => {
		if (value === null || value === undefined) {
			return (
				<span className="text-gray-400 dark:text-zinc-600 italic">null</span>
			);
		}

		if (typeof value === "object") {
			return (
				<pre className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg overflow-auto text-xs font-mono text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 max-h-96">
					{JSON.stringify(value, null, 2)}
				</pre>
			);
		}

		if (typeof value === "boolean") {
			return (
				<span
					className={`font-semibold ${
						value
							? "text-green-600 dark:text-green-400"
							: "text-red-600 dark:text-red-400"
					}`}
				>
					{String(value)}
				</span>
			);
		}

		if (typeof value === "number") {
			return (
				<span className="text-blue-600 dark:text-blue-400 font-mono">
					{value}
				</span>
			);
		}

		return (
			<span className="text-gray-900 dark:text-white break-words">
				{String(value)}
			</span>
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
				<Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
				<p className="text-gray-600 dark:text-zinc-400 font-medium animate-pulse">
					Loading Submission...
				</p>
			</div>
		);
	}

	if (error || !submission) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-8 max-w-md">
					<h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
						Error
					</h2>
					<p className="text-red-600 dark:text-red-300 mb-6">
						{error instanceof Error ? error.message : "Submission not found"}
					</p>
					<Link
						href={`/admin/${endpoint}`}
						className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Submissions
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12 transition-colors duration-300">
			{/* Header */}
			<div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
						<div className="flex items-center gap-4">
							<Link
								href={`/admin/${endpoint}`}
								className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								<span className="text-sm font-medium">Back to Submissions</span>
							</Link>
							<div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-100 dark:shadow-none shadow-lg">
								<LayoutDashboard className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
									Submission Details
								</h1>
								<p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
									{endpoint}
								</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<ThemeToggle />
							<button
								onClick={handleDelete}
								className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-all"
							>
								<Trash2 className="w-4 h-4" />
								Delete
							</button>
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

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Metadata Card */}
					<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
						<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
							<Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
							Metadata
						</h2>
						<div className="space-y-4">
							<div>
								<label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
									Submission ID
								</label>
								<p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 p-2 rounded mt-1 break-all">
									{submission.id}
								</p>
							</div>
							<div>
								<label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
									Timestamp
								</label>
								<p className="text-sm text-gray-900 dark:text-white mt-1">
									{formatDate(submission.created_at)}
								</p>
							</div>
							{submission.ip_address && (
								<div>
									<label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
										<Globe className="w-3 h-3" />
										IP Address
									</label>
									<p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 p-2 rounded mt-1">
										{submission.ip_address}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Form Data Card */}
					<div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
						<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
							<Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
							Form Data
						</h2>
						<div className="space-y-4">
							{(() => {
								const dataObj =
									typeof submission.data === "object" &&
									submission.data !== null
										? (submission.data as Record<string, unknown>)
										: {};
								const entries = Object.entries(dataObj);
								return entries.length > 0 ? (
									entries.map(([key, value]) => (
										<div
											key={key}
											className="border-b border-gray-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0"
										>
											<label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
												{key}
											</label>
											<div className="text-sm">{renderValue(value)}</div>
										</div>
									))
								) : (
									<p className="text-gray-400 dark:text-zinc-600 italic">
										No form data available
									</p>
								);
							})()}
						</div>
					</div>

					{/* Browser Info Card */}
					<div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
						<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
							<Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
							Browser Information
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{(() => {
								const browserObj =
									typeof submission.browser_info === "object" &&
									submission.browser_info !== null
										? (submission.browser_info as Record<string, unknown>)
										: {};
								const entries = Object.entries(browserObj);
								return entries.length > 0 ? (
									entries.map(([key, value]) => (
										<div
											key={key}
											className="bg-gray-50 dark:bg-zinc-950 rounded-lg p-4 border border-gray-100 dark:border-zinc-800"
										>
											<label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
												{key}
											</label>
											<div className="text-sm">{renderValue(value)}</div>
										</div>
									))
								) : (
									<p className="text-gray-400 dark:text-zinc-600 italic">
										No browser information available
									</p>
								);
							})()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
