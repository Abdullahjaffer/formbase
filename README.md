# Form Backend with Admin Panel

A Next.js backend service for capturing form submissions with a protected admin dashboard.

## Features

- **Dynamic API Endpoints**: Accept POST requests to any endpoint (e.g., `/api/contact_form`)
- **PostgreSQL Database**: Store submissions with metadata and browser information
- **Admin Dashboard**: Protected admin panel to view and filter submissions
- **Authentication**: Simple username/password authentication using environment variables
- **Character Limits**: Built-in validation to prevent abuse

## Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/form_backend"

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# JWT Secret (generate a secure random string for production)
JWT_SECRET=your-jwt-secret-key-change-this-in-production
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Usage

### Submit Form Data

Send POST requests to any endpoint under `/api/`:

```bash
curl -X POST http://localhost:3000/api/contact_form \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","message":"Hello!"}'
```

### Admin Access

1. Visit `/admin/login` to log in with your admin credentials
2. Access the dashboard at `/admin` to view submissions

## Database Schema

The `Submission` table includes:

- `id`: UUID primary key
- `endpoint_name`: The API endpoint name (max 255 chars)
- `data`: JSONB form data
- `browser_info`: JSONB browser and request metadata
- `created_at`: Timestamp
- `ip_address`: IP address (max 45 chars for IPv6)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
