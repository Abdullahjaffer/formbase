"use client";

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

interface DataItem {
	name?: string;
	type?: string;
	count: number;
}

interface Props {
	devices: DataItem[];
	browsers: DataItem[];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DeviceBrowserChart({ devices, browsers }: Props) {
	const deviceData = devices.map((d) => ({ name: d.type, value: d.count }));
	const browserData = browsers.map((b) => ({ name: b.name, value: b.count }));

	return (
		<div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
			<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
				Devices & Browsers
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
				<div className="h-full w-full">
					<p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
						Device Types
					</p>
					<ResponsiveContainer width="100%" height="90%">
						<PieChart>
							<Pie
								data={deviceData}
								cx="50%"
								cy="50%"
								innerRadius={40}
								outerRadius={60}
								paddingAngle={5}
								dataKey="value"
								animationDuration={1500}
							>
								{deviceData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "white",
									border: "none",
									borderRadius: "8px",
									boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
									fontSize: "10px",
								}}
							/>
							<Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="h-full w-full">
					<p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
						Browsers
					</p>
					<ResponsiveContainer width="100%" height="90%">
						<PieChart>
							<Pie
								data={browserData}
								cx="50%"
								cy="50%"
								innerRadius={40}
								outerRadius={60}
								paddingAngle={5}
								dataKey="value"
								animationDuration={1500}
							>
								{browserData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "white",
									border: "none",
									borderRadius: "8px",
									boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
									fontSize: "10px",
								}}
							/>
							<Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
