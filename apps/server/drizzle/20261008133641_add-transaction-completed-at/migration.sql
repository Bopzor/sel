ALTER TABLE "transactions" ADD COLUMN "completed_at" timestamp(3);
--> statement-breakpoint
UPDATE "transactions" SET "completed_at" = "updated_at" WHERE "status" = 'completed';
