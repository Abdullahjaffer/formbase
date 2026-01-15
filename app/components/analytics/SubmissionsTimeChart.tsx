"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface TimeSeriesData {
	date: string;
	count: number;
}

interface Props {
	data: TimeSeriesData[];
}

export function SubmissionsTimeChart({ data }: Props) {
	return (
		<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-bold text-gray-900 dark:text-white">
					Submission Trends
				</h3>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 bg-indigo-500 rounded-full" />
					<span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
						Total Submissions
					</span>
				</div>
			</div>
			<div className="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
					>
						<defs>
							<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
								<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#e2e8f0"
							className="dark:stroke-zinc-800"
						/>
						<XAxis
							dataKey="date"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#94a3b8" }}
							minTickGap={30}
							formatter={(value: string) =>
								new Date(value).toLocaleDateString(undefined, {
									month: "short",
									day: "numeric",
								})
							}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 10, fill: "#94a3b8" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "white",
								border: "none",
								borderRadius: "8px",
								boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
								fontSize: "12px",
							}}
							itemStyle={{ color: "#4f46e5", fontWeight: "bold" }}
							labelStyle={{ color: "#64748b", marginBottom: "4px" }}
							cursor={{ stroke: "#6366f1", strokeWidth: 2 }}
						/>
						<Area
							type="monotone"
							dataKey="count"
							stroke="#6366f1"
							strokeWidth={3}
							fillOpacity={1}
							fill="url(#colorCount)"
							animationDuration={1500}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
