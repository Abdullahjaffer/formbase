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
		return { success: true };
	} catch (error) {
		console.error("Error deleting submission:", error);
		throw new Error("Failed to delete submission");
	}
}
