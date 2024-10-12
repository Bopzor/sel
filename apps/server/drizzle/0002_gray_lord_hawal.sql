ALTER TABLE "members" ADD COLUMN "membership_start_date" timestamp(3) DEFAULT CURRENT_DATE NOT NULL;
UPDATE "members" SET "membership_start_date" = "created_at";
UPDATE "members" SET "created_at" = CURRENT_DATE;