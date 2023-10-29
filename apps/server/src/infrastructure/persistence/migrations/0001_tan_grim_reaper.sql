DO $$ BEGIN
 CREATE TYPE "tokenType" AS ENUM('authentication', 'session');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"value" varchar(256) NOT NULL,
	"expiration_date" timestamp(3) NOT NULL,
	"type" "tokenType" NOT NULL,
	"created_at" timestamp(3) NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "updated_at" SET NOT NULL;