-- CreateTable
CREATE TABLE "endpoint_views" (
    "endpoint_name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "last_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "endpoint_views_pkey" PRIMARY KEY ("endpoint_name","username")
);
