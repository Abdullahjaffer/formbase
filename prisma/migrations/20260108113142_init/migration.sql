-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "endpoint_name" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "browser_info" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);
