"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface GeographicData {
	country: string;
	count: number;
}

interface Props {
	data: GeographicData[];
}

export function GeographicChart({ data }: Props) {
	return (
		<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
			<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
				Geographic Distribution
			</h3>
			<div className="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						layout="vertical"
						margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={true}
							vertical={false}
							stroke="#e2e8f0"
							className="dark:stroke-zinc-800"
						/>
						<XAxis type="number" hide />
						<YAxis
							dataKey="country"
							type="category"
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
							width={80}
						/>
						<Tooltip
							cursor={{ fill: "#f1f5f9", opacity: 0.5 }}
							contentStyle={{
								backgroundColor: "white",
								border: "none",
								borderRadius: "8px",
								boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
								fontSize: "12px",
							}}
						/>
						<Bar
							dataKey="count"
							fill="#10b981"
							radius={[0, 4, 4, 0]}
							barSize={20}
							animationDuration={1500}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
