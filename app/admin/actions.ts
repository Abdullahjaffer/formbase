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
	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const endpoints = await prisma.submission.groupBy({
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
		});

		return endpoints.map((endpoint) => ({
			endpoint_name: endpoint.endpoint_name,
			count: endpoint._count.id,
			latest_submission_at: endpoint._max.created_at,
		}));
	} catch (error) {
		console.error("Error fetching endpoint summary:", error);
		throw new Error("Failed to fetch endpoint summary");
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
