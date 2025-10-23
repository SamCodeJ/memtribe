-- AlterTable Features: Add missing fields
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "display_name" TEXT;
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "default_value" TEXT;
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'events';
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;

-- Update display_name from feature_name for existing records
UPDATE "features" SET "display_name" = "feature_name" WHERE "display_name" IS NULL;

-- AlterTable Packages: Add missing fields and modify existing
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "monthly_price" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "yearly_price" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "is_popular" BOOLEAN DEFAULT false;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "display_order" INTEGER DEFAULT 0;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "color_scheme" TEXT DEFAULT 'blue';

-- Copy price to monthly_price for existing records
UPDATE "packages" SET "monthly_price" = "price" WHERE "monthly_price" = 0;

-- Make billing_cycle optional since we now have separate monthly/yearly prices
ALTER TABLE "packages" ALTER COLUMN "billing_cycle" DROP NOT NULL;

