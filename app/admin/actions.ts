"use server";

import { verifyAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubmissions() {
	const session = await verifyAdminSession();
	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const submissions = await prisma.submission.findMany({
			orderBy: {
				created_at: "desc",
			},
		});

		return submissions;
	} catch (error) {
		console.error("Error fetching submissions:", error);
		throw new Error("Failed to fetch submissions");
	}
}

export async function deleteSubmission(id: string) {
	const session = await verifyAdminSession();
	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		await prisma.submission.delete({
			where: { id },
		});
		revalidatePath("/admin");
		revalidatePath("/admin/[endpoint]");
		return { success: true };
	} catch (error) {
		console.error("Error deleting submission:", error);
		throw new Error("Failed to delete submission");
	}
}

export async function getEndpointSummary() {
	const session = await verifyAdminSession();
	if (!session || !session.username) {
		throw new Error("Unauthorized");
	}

	const username = session.username as string;

	try {
		const [endpoints, views] = await Promise.all([
			prisma.submission.groupBy({
				by: ["endpoint_name"],
				_count: {
					id: true,
				},
				_max: {
					created_at: true,
				},
				orderBy: {
					_count: {
						id: "desc",
					},
				},
			}),
			prisma.endpointView.findMany({
				where: { username },
			}),
		]);

		const viewsMap = new Map(
			views.map((v) => [v.endpoint_name, v.last_viewed_at])
		);

		return endpoints.map((endpoint) => ({
			endpoint_name: endpoint.endpoint_name,
			count: endpoint._count.id,
			latest_submission_at: endpoint._max.created_at,
			last_viewed_at: viewsMap.get(endpoint.endpoint_name) || null,
		}));
	} catch (error) {
		console.error("Error fetching endpoint summary:", error);
		throw new Error("Failed to fetch endpoint summary");
	}
}

export async function updateLastViewed(endpoint: string) {
	const session = await verifyAdminSession();
	if (!session || !session.username) {
		throw new Error("Unauthorized");
	}

	const username = session.username as string;

	try {
		await prisma.endpointView.upsert({
			where: {
				endpoint_name_username: {
					endpoint_name: endpoint,
					username: username,
				},
			},
			update: {
				last_viewed_at: new Date(),
			},
			create: {
				endpoint_name: endpoint,
				username: username,
				last_viewed_at: new Date(),
			},
		});
		return { success: true };
	} catch (error) {
		console.error("Error updating last viewed:", error);
		throw new Error("Failed to update last viewed");
	}
}

export async function getSubmissionsByEndpoint(endpoint: string) {
	const session = await verifyAdminSession();
	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const submissions = await prisma.submission.findMany({
			where: {
				endpoint_name: endpoint,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		return submissions;
	} catch (error) {
		console.error("Error fetching submissions by endpoint:", error);
		throw new Error("Failed to fetch submissions for endpoint");
	}
}

export async function getSubmissionById(id: string) {
	const session = await verifyAdminSession();
	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const submission = await prisma.submission.findUnique({
			where: { id },
		});

		if (!submission) {
			throw new Error("Submission not found");
		}

		return submission;
	} catch (error) {
		console.error("Error fetching submission:", error);
		throw new Error("Failed to fetch submission");
	}
}

export async function exportSubmissionsToCSV(endpoint: string) {
	const session = await verifyAdminSession();
	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const submissions = await prisma.submission.findMany({
			where: {
				endpoint_name: endpoint,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		if (submissions.length === 0) {
			return "";
		}

		// Collect all possible keys from data and browser_info
		const dataKeys = new Set<string>();
		const browserKeys = new Set<string>();

		submissions.forEach((sub) => {
			if (typeof sub.data === "object" && sub.data !== null) {
				Object.keys(sub.data as Record<string, unknown>).forEach((key) =>
					dataKeys.add(key)
				);
			}
			if (typeof sub.browser_info === "object" && sub.browser_info !== null) {
				Object.keys(sub.browser_info as Record<string, unknown>).forEach(
					(key) => browserKeys.add(key)
				);
			}
		});

		const sortedDataKeys = Array.from(dataKeys).sort();
		const sortedBrowserKeys = Array.from(browserKeys).sort();

		// Headers
		const headers = [
			"Timestamp",
			"IP Address",
			...sortedDataKeys,
			...sortedBrowserKeys.map((k) => `browser_${k}`),
		];

		const escapeCSV = (val: unknown) => {
			if (val === null || val === undefined) return "";
			const str = typeof val === "object" ? JSON.stringify(val) : String(val);
			return `"${str.replace(/"/g, '""')}"`;
		};

		const rows = submissions.map((sub) => {
			const data = (sub.data as Record<string, unknown>) || {};
			const browser = (sub.browser_info as Record<string, unknown>) || {};

			return [
				escapeCSV(sub.created_at.toISOString()),
				escapeCSV(sub.ip_address),
				...sortedDataKeys.map((key) => escapeCSV(data[key])),
				...sortedBrowserKeys.map((key) => escapeCSV(browser[key])),
			].join(",");
		});

		return [headers.join(","), ...rows].join("\n");
	} catch (error) {
		console.error("Error exporting submissions:", error);
		throw new Error("Failed to export submissions");
	}
}

export async function getAnalyticsData(days: number = 30) {
	const session = await verifyAdminSession();
	if (!session) {
		throw new Error("Unauthorized");
	}

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	try {
		const submissions = await prisma.submission.findMany({
			where: {
				created_at: {
					gte: startDate,
				},
			},
			select: {
				created_at: true,
				browser_info: true,
				endpoint_name: true,
			},
		});

		// Time series aggregation
		const timeSeriesMap = new Map<string, number>();
		// Initialize all days in the range with 0
		for (let i = 0; i <= days; i++) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			timeSeriesMap.set(d.toISOString().split("T")[0], 0);
		}

		// Geographic and Browser/Device aggregation
		const countryMap = new Map<string, number>();
		const deviceMap = new Map<string, number>();
		const browserMap = new Map<string, number>();
		const endpointPerfMap = new Map<string, number>();

		submissions.forEach((sub) => {
			// Time series
			const dateKey = sub.created_at.toISOString().split("T")[0];
			if (timeSeriesMap.has(dateKey)) {
				timeSeriesMap.set(dateKey, (timeSeriesMap.get(dateKey) || 0) + 1);
			}

			// Endpoint Performance
			endpointPerfMap.set(
				sub.endpoint_name,
				(endpointPerfMap.get(sub.endpoint_name) || 0) + 1
			);

			const browserInfo = (sub.browser_info as Record<string, unknown>) || {};

			// Country
			const country = (browserInfo.country as string) || "Unknown";
			countryMap.set(country, (countryMap.get(country) || 0) + 1);

			// Device Type (Mobile/Desktop)
			const isMobile =
				browserInfo.mobile === "true" ||
				/mobile|android|iphone|ipad|phone/i.test(
					(browserInfo.userAgent as string) || ""
				);
			const deviceType = isMobile ? "Mobile" : "Desktop";
			deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1);

			// Browser Name
			const ua = (browserInfo.userAgent as string) || "";
			let browserName = "Other";
			if (/chrome/i.test(ua)) browserName = "Chrome";
			else if (/safari/i.test(ua) && !/chrome/i.test(ua))
				browserName = "Safari";
			else if (/firefox/i.test(ua)) browserName = "Firefox";
			else if (/edg/i.test(ua)) browserName = "Edge";
			browserMap.set(browserName, (browserMap.get(browserName) || 0) + 1);
		});

		return {
			timeSeries: Array.from(timeSeriesMap.entries())
				.map(([date, count]) => ({ date, count }))
				.sort((a, b) => a.date.localeCompare(b.date)),
			geographic: Array.from(countryMap.entries())
				.map(([country, count]) => ({ country, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10),
			devices: Array.from(deviceMap.entries()).map(([type, count]) => ({
				type,
				count,
			})),
			browsers: Array.from(browserMap.entries()).map(([name, count]) => ({
				name,
				count,
			})),
			endpoints: Array.from(endpointPerfMap.entries())
				.map(([name, count]) => ({ name, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10),
			totalSubmissions: submissions.length,
			averagePerDay: Math.round((submissions.length / days) * 10) / 10,
		};
	} catch (error) {
		console.error("Error fetching analytics data:", error);
		throw new Error("Failed to fetch analytics data");
	}
}
