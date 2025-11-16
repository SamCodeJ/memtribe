-- AlterTable
ALTER TABLE "users" ADD COLUMN "subscription_status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "subscription_start" TIMESTAMP(3),
ADD COLUMN "subscription_end" TIMESTAMP(3),
ADD COLUMN "last_payment_date" TIMESTAMP(3),
ADD COLUMN "next_billing_date" TIMESTAMP(3);

-- Update existing users to have subscription_start as their created_at date
UPDATE "users" SET "subscription_start" = "created_at" WHERE "subscription_start" IS NULL;

