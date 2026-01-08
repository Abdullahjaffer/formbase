# Any-Form: The Universal Form Backend

**Self-hostable.** Manage all your forms from different websites, apps, and services in **one single place**. Any-Form is a lightweight, zero-config backend that lets you collect submissions from any source and view them in a beautiful, unified dashboard.

![Any-Form Dashboard](./public/Screenshot%202026-01-08%20at%205.34.17%20PM.png)

## Why Any-Form?

Instead of setting up separate backends or using expensive third-party services for every simple contact form or lead capture, Any-Form provides a central hub. Just send a POST request from anywhere, and it's instantly managed.

Since it's open-source and self-hostable, you own your data. Clone it, deploy it to your own server, and you're ready to go.

## Features

- **🚀 Universal Endpoints**: Send data to `your-domain.com/api/YOUR_CUSTOM_NAME` and it works instantly. No pre-registration of forms required.
- **📊 Unified Dashboard**: A clean, powerful admin panel to view, search, and filter submissions from all your different endpoints.
- **🕵️ Deep Insights**: Automatically captures browser information, IP addresses, and timestamps for every submission.
- **🔒 Secure Access**: Protected admin dashboard using JWT authentication and environment-based credentials.
- **🛡️ Built-in Protection**: Character limits and JSON size validation to prevent abuse.
- **📱 Responsive Design**: Manage your submissions on the go from any device.

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/any-form.git
cd any-form
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/any_form"

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Security
JWT_SECRET=your-secure-random-string
```

### 2. Database Setup

Ensure you have PostgreSQL running, then initialize the database schema:

```bash
npx prisma migrate dev --name init
```

### 3. Installation & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access your dashboard.

## API Usage

### Submitting Data

You can send data from any frontend using a simple `fetch` request:

```javascript
fetch("https://your-any-form-instance.com/api/contact-page", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		name: "John Doe",
		email: "john@example.com",
		message: "I love Any-Form!",
	}),
});
```

The endpoint name (`contact-page` in this example) is dynamic. You can use whatever name you like to categorize your form submissions.

## Deployment

Any-Form is designed to be hosted anywhere.

- **Vercel**: The easiest way to deploy. Just push your code to GitHub and connect it to Vercel.
- **Docker**: You can easily containerize this app for any cloud provider.
- **VPS (Ubuntu/Nginx)**: Use PM2 to keep the Next.js app running on your own server.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Auth**: JWT via [jose](https://github.com/panva/jose)

---

Built to simplify form management for developers.
