DO $$ BEGIN
 CREATE TYPE "member_status" AS ENUM('inactive', 'active');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
	"member_id" varchar(16) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	CONSTRAINT "tokens_value_unique" UNIQUE("value")
);
--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "status" "member_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "email_visible" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "onboarding_completed_date" timestamp(3);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
