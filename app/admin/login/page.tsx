"use client";

import { Eye, EyeOff, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function AdminLogin() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/admin/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				router.push("/admin");
			} else {
				const data = await response.json();
				setError(data.error || "Login failed");
			}
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
			<div className="absolute top-4 right-4 sm:top-8 sm:right-8">
				<ThemeToggle />
			</div>
			<div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
				<div>
					<div className="flex justify-center">
						<div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
							<Layers className="w-8 h-8 text-white" />
						</div>
					</div>
					<h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
						Admin Login
					</h2>
					<p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-medium">
						Sign in to access the FormBase control panel
					</p>
				</div>
				<form className="mt-8 space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-0">
						<div className="relative">
							<label htmlFor="username" className="sr-only">
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								required
								autoComplete="username"
								autoCapitalize="none"
								autoCorrect="off"
								className="appearance-none relative block w-full px-4 py-3 sm:py-3 border border-gray-200 dark:border-zinc-800 placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm transition-all min-h-[48px]"
								placeholder="Username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
						<div className="relative">
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								autoComplete="current-password"
								className="appearance-none relative block w-full px-4 py-3 sm:py-3 border border-gray-200 dark:border-zinc-800 placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-900 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm transition-all pr-12 -mt-px min-h-[48px]"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 pr-4 flex items-center z-20 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-w-[44px] justify-center"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						</div>
					</div>

					{error && (
						<div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4">
							<div className="text-sm text-red-700 dark:text-red-400 font-medium text-center">
								{error}
							</div>
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign in to Dashboard"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
