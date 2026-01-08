import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Character limits as requested
const MAX_ENDPOINT_NAME_LENGTH = 255;
const MAX_JSON_SIZE_BYTES = 1024 * 1024; // 1MB limit for JSON data
const MAX_IP_LENGTH = 45; // IPv6 addresses can be up to 45 characters

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ endpoint: string }> }
) {
	try {
		const { endpoint } = await params;
		console.log(endpoint);
		const endpoint_name = endpoint;

		// Validate endpoint name length
		if (endpoint_name.length > MAX_ENDPOINT_NAME_LENGTH) {
			return NextResponse.json(
				{ error: "Endpoint name too long" },
				{ status: 400 }
			);
		}

		// Get the request body as text first to check size
		const bodyText = await request.text();

		if (bodyText.length > MAX_JSON_SIZE_BYTES) {
			return NextResponse.json(
				{ error: "Request body too large" },
				{ status: 413 }
			);
		}

		// Parse JSON data
		let data: Record<string, unknown>;
		try {
			data = JSON.parse(bodyText);
			if (
				typeof data !== "object" ||
				data === null ||
				Array.isArray(data) ||
				data === undefined ||
				Object.keys(data).length > 30
			) {
				console.error("Invalid JSON data");
				return NextResponse.json(
					{ error: "Invalid JSON data" },
					{ status: 400 }
				);
			}
		} catch {
			console.error("Invalid JSON data");
			return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 });
		}

		// Extract browser info from headers
		const userAgent = request.headers.get("user-agent") || "Unknown";
		const acceptLanguage = request.headers.get("accept-language") || "Unknown";
		const referer = request.headers.get("referer") || "Unknown";

		// Get IP address (considering proxy headers)
		const forwardedFor = request.headers.get("x-forwarded-for");
		const realIp = request.headers.get("x-real-ip");
		const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "Unknown";

		// Validate IP length
		const ipAddress = ip && ip.length <= MAX_IP_LENGTH ? ip : "Unknown";

		// Prepare browser info object
		const browser_info = {
			userAgent,
			acceptLanguage,
			referer,
			ipAddress,
			timestamp: new Date().toISOString(),
		};

		// Save to database
		const submission = await prisma.submission.create({
			data: {
				endpoint_name,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				data: data as any,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				browser_info: browser_info as any,
				ip_address: ipAddress,
			},
		});

		return NextResponse.json(
			{
				success: true,
				id: submission.id,
				message: "Form submission saved successfully",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error saving form submission:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Handle other HTTP methods
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ endpoint: string }> }
) {
	await params;
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ endpoint: string }> }
) {
	await params;
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ endpoint: string }> }
) {
	await params;
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
