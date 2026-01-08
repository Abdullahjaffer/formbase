import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Handle CORS for API routes
	if (pathname.startsWith("/api/")) {
		// Handle preflight OPTIONS request
		if (request.method === "OPTIONS") {
			return new NextResponse(null, {
				status: 200,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers":
						"Content-Type, Authorization, X-Requested-With",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		// Add CORS headers to API responses
		const response = NextResponse.next();
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS"
		);
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With"
		);
		return response;
	}

	// Only protect admin routes
	if (!pathname.startsWith("/admin")) {
		return NextResponse.next();
	}

	// Allow access to login page
	if (pathname === "/admin/login") {
		return NextResponse.next();
	}

	// Check for session cookie
	const token = request.cookies.get("admin_session")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	try {
		// Verify JWT token
		await jwtVerify(token, JWT_SECRET);
		return NextResponse.next();
	} catch {
		// Token is invalid or expired
		const response = NextResponse.redirect(
			new URL("/admin/login", request.url)
		);
		response.cookies.delete("admin_session");
		return response;
	}
}

export const config = {
	matcher: ["/api/:path*", "/admin/:path*"],
};
