CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"subscription_id" varchar(16) NOT NULL,
	"event_id" varchar(16),
	"date" timestamp (3) NOT NULL,
	"read_at" timestamp (3),
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"active" boolean NOT NULL,
	"type" varchar(32) NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"request_id" varchar(16),
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- added manually, as drizzle doesn't support adding psql constraints
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_unique_parent_relation" CHECK (num_nonnulls("request_id") <= 1);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;