ALTER TABLE "notifications" ADD COLUMN "member_id" varchar(16);
UPDATE "notifications" SET "member_id" = (SELECT "member_id" from "subscriptions" s WHERE "s"."id" = "subscription_id");
ALTER TABLE "notifications" ALTER COLUMN "member_id" SET NOT NULL;

DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "notifications" DROP CONSTRAINT "notifications_subscription_id_subscriptions_id_fk";
DROP TABLE "subscriptions";

ALTER TABLE "notifications" ADD COLUMN "context" json;
UPDATE "notifications" SET "context" = '{}';
ALTER TABLE "notifications" ALTER COLUMN "context" SET NOT NULL;

ALTER TABLE "notifications" DROP COLUMN IF EXISTS "subscription_id";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "entity_id";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "delivery_type";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "title";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "push";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "email";

CREATE TABLE IF NOT EXISTS "notification_deliveries" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"notification_id" varchar(16) NOT NULL,
	"delivery_type" "notification_delivery_type" NOT NULL,
	"target" text NOT NULL,
	"delivered" boolean DEFAULT false NOT NULL,
	"error" json,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
