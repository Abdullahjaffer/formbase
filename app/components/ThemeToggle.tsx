"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="p-2 w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700" />
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all border border-gray-300 dark:border-zinc-700 flex items-center justify-center"
			aria-label="Toggle theme"
		>
			{isDark ? (
				<Sun className="w-5 h-5 text-amber-500" />
			) : (
				<Moon className="w-5 h-5 text-indigo-600" />
			)}
		</button>
	);
}
