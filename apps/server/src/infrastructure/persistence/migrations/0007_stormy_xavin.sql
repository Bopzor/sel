CREATE TABLE IF NOT EXISTS "member_device" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"device_subscription" text NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "member_device_member_id_device_subscription_unique" UNIQUE("member_id","device_subscription")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_device" ADD CONSTRAINT "member_device_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
