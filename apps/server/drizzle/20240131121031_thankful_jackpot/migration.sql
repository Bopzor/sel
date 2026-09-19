DO $$ BEGIN
 CREATE TYPE "notification_delivery_type" AS ENUM('email', 'push');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_device" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"device_subscription" text NOT NULL,
	"device_type" varchar(32) NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "member_device_member_id_device_subscription_unique" UNIQUE("member_id","device_subscription")
);
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "notification_delivery" notification_delivery_type[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type" varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "delivery_type" notification_delivery_type[] NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "title_trimmed" varchar(65) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_device" ADD CONSTRAINT "member_device_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
