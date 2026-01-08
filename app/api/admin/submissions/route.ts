import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Get query parameters for potential filtering/pagination
		const { searchParams } = new URL(request.url);
		const endpoint = searchParams.get("endpoint");
		const limit = parseInt(searchParams.get("limit") || "100");
		const offset = parseInt(searchParams.get("offset") || "0");

		// Build where clause
		const where: any = {};
		if (endpoint && endpoint !== "all") {
			where.endpoint_name = endpoint;
		}

		// Fetch submissions with ordering (newest first)
		const submissions = await prisma.submission.findMany({
			where,
			orderBy: {
				created_at: "desc",
			},
			take: Math.min(limit, 1000), // Max 1000 per request
			skip: offset,
		});

		// Get total count for pagination info
		const totalCount = await prisma.submission.count({ where });

		return NextResponse.json({
			submissions,
			totalCount,
			limit,
			offset,
		});
	} catch (error) {
		console.error("Error fetching submissions:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
