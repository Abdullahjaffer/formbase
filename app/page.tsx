import {
	ArrowRight,
	BarChart3,
	Code2,
	Database,
	Github,
	Globe,
	Layers,
	LayoutDashboard,
	ShieldCheck,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";

export default function Home() {
	return (
		<div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-700 dark:selection:text-indigo-300">
			{/* Navigation */}
			<nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-2">
							<div className="bg-indigo-600 p-1.5 rounded-lg">
								<Layers className="w-5 h-5 text-white" />
							</div>
							<span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
								Any-Form
							</span>
						</div>
						<div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-zinc-400">
							<a
								href="#features"
								className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
							>
								Features
							</a>
							<a
								href="#how-it-works"
								className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
							>
								How it Works
							</a>
							<div className="flex items-center gap-4">
								<ThemeToggle />
								<Link
									href="/admin"
									className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-sm"
								>
									Dashboard
									<ArrowRight className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-4">
				<div className="max-w-5xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-fade-in border border-indigo-100 dark:border-indigo-800">
						<Zap className="w-4 h-4" />
						<span>The Universal Form Backend</span>
					</div>
					<h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
						Manage all your forms <br />
						<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">
							in one single place.
						</span>
					</h1>
					<p className="text-xl text-gray-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
						Stop building custom backends for every form. Send your data to
						Any-Form and manage everything from a beautiful dashboard.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href="/admin"
							className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 group"
						>
							<LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
							Go to Admin Panel
						</Link>
						<a
							href="https://github.com/abdullah/any-form-backend"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
						>
							<Github className="w-5 h-5" />
							View on GitHub
						</a>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="py-24 bg-gray-50/50 dark:bg-zinc-900/30"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Everything you need for form management
						</h2>
						<p className="text-gray-600 dark:text-zinc-400">
							Built for developers who value speed and simplicity.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								icon: (
									<Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								),
								title: "Universal Endpoints",
								description:
									"Create endpoints on the fly. Just send data to any URL path and it's instantly active.",
							},
							{
								icon: (
									<BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
								),
								title: "Unified Dashboard",
								description:
									"A central hub to view, search, and filter submissions from all your different websites.",
							},
							{
								icon: (
									<ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
								),
								title: "Secure & Private",
								description:
									"Self-hostable solution. You own your data. Protected by JWT authentication.",
							},
							{
								icon: (
									<Code2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
								),
								title: "Zero Config",
								description:
									"No need to pre-define schemas or register forms. Any JSON payload is accepted.",
							},
							{
								icon: (
									<Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
								),
								title: "Insights Built-in",
								description:
									"Automatically captures IP addresses, browser info, and timestamps for every entry.",
							},
							{
								icon: (
									<Zap className="w-6 h-6 text-rose-600 dark:text-rose-400" />
								),
								title: "Lightweight",
								description:
									"Built with Next.js 15 for maximum performance and easy deployment to Vercel or VPS.",
							},
						].map((feature, index) => (
							<div
								key={index}
								className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group"
							>
								<div className="bg-gray-50 dark:bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
									{feature.icon}
								</div>
								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it Works (API Demo) */}
			<section id="how-it-works" className="py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row items-center gap-16">
						<div className="flex-1">
							<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
								Integrate in 30 seconds
							</h2>
							<p className="text-lg text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
								Send data from any website, app, or server using a simple POST
								request. Categorize your submissions using dynamic endpoint
								names in the URL.
							</p>
							<ul className="space-y-4">
								{[
									"No API keys required to submit data",
									"Supports any valid JSON payload",
									"Instant appearance in your dashboard",
									"Handles multiple sources simultaneously",
								].map((item, i) => (
									<li
										key={i}
										className="flex items-center gap-3 text-gray-700 dark:text-zinc-300 font-medium"
									>
										<div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
											<ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
										</div>
										{item}
									</li>
								))}
							</ul>
						</div>
						<div className="flex-1 w-full">
							<div className="bg-gray-900 dark:bg-black rounded-3xl p-1 shadow-2xl overflow-hidden border border-gray-800 dark:border-zinc-800">
								<div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 dark:border-zinc-800">
									<div className="w-3 h-3 rounded-full bg-red-500"></div>
									<div className="w-3 h-3 rounded-full bg-amber-500"></div>
									<div className="w-3 h-3 rounded-full bg-green-500"></div>
									<span className="text-gray-500 text-xs font-mono ml-2">
										form-submit.js
									</span>
								</div>
								<div className="p-6 overflow-x-auto">
									<pre className="text-indigo-300 dark:text-indigo-400 font-mono text-sm leading-relaxed">
										<code>
											{`fetch('/api/contact-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    message: 'Hello from Any-Form!',
    plan: 'Premium'
  })
})`}
										</code>
									</pre>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 px-4">
				<div className="max-w-4xl mx-auto bg-indigo-600 dark:bg-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none text-white">
					<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
					<h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
						Ready to simplify your <br /> form management?
					</h2>
					<p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
						Join developers who are saving time by centralizing their form
						submissions. Completely free and open source.
					</p>
					<Link
						href="/admin"
						className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-indigo-50 transition-all shadow-lg relative z-10"
					>
						Launch Dashboard
						<ArrowRight className="w-5 h-5" />
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 border-t border-gray-100 dark:border-zinc-800">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<div className="flex items-center justify-center gap-2 mb-6">
						<div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-lg">
							<Layers className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
						</div>
						<span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
							Any-Form
						</span>
					</div>
					<p className="text-gray-500 dark:text-zinc-400 text-sm">
						&copy; {new Date().getFullYear()} Any-Form. Built for developers.
						<br />
						Created by{" "}
						<a
							href="https://codexty.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-indigo-600 dark:text-indigo-400 hover:underline"
						>
							codexty.com
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}
