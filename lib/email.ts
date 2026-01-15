import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT) || 587,
	secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export async function sendSubmissionNotification(submission: any) {
	const { endpoint_name, data, browser_info, created_at, ip_address } =
		submission;
	const adminEmail = process.env.ADMIN_EMAIL;
	const appUrl = process.env.APP_URL || "http://localhost:3000";

	if (!adminEmail) {
		console.warn("ADMIN_EMAIL not set, skipping email notification");
		return;
	}

	const formDataHtml = Object.entries(data || {})
		.map(
			([key, value]) =>
				`<li><strong>${key}:</strong> ${
					typeof value === "object" ? JSON.stringify(value) : value
				}</li>`
		)
		.join("");

	const browserInfo = (browser_info as Record<string, any>) || {};
	const country = browserInfo.country || "Unknown";
	const platform = browserInfo.platform || "Unknown";
	const userAgent = browserInfo.userAgent || "Unknown";

	const adminUrl = `${appUrl}/admin/${endpoint_name}/${submission.id}`;

	const mailOptions = {
		from: `"FormBase Notifications" <${process.env.SMTP_USER}>`,
		to: adminEmail,
		subject: `🔔 New Submission - ${endpoint_name}`,
		text: `
New Form Submission Received

Endpoint: ${endpoint_name}
Timestamp: ${new Date(created_at).toLocaleString()}
IP Address: ${ip_address}

Form Data:
${Object.entries(data || {})
	.map(([key, value]) => `- ${key}: ${value}`)
	.join("\n")}

Browser Information:
- Country: ${country}
- Device: ${platform}
- User Agent: ${userAgent}

View full details: ${adminUrl}
		`,
		html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
	<h2 style="color: #4f46e5; margin-top: 0;">New Form Submission Received</h2>
	
	<div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
		<p style="margin: 5px 0;"><strong>Endpoint:</strong> ${endpoint_name}</p>
		<p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date(
			created_at
		).toLocaleString()}</p>
		<p style="margin: 5px 0;"><strong>IP Address:</strong> ${ip_address}</p>
	</div>

	<h3 style="font-size: 16px; margin-bottom: 10px;">Form Data:</h3>
	<ul style="padding-left: 20px; margin-bottom: 20px;">
		${formDataHtml}
	</ul>

	<h3 style="font-size: 16px; margin-bottom: 10px;">Browser Information:</h3>
	<ul style="list-style: none; padding: 0; margin-bottom: 25px; font-size: 13px; color: #64748b;">
		<li><strong>Country:</strong> ${country}</li>
		<li><strong>Device:</strong> ${platform}</li>
		<li><strong>User Agent:</strong> ${userAgent}</li>
	</ul>

	<a href="${adminUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Details</a>
	
	<p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
		This is an automated notification from your FormBase backend.
	</p>
</div>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Email notification sent for submission ${submission.id}`);
	} catch (error) {
		console.error("Failed to send email notification:", error);
		// We don't rethrow here to avoid breaking the submission flow
	}
}
