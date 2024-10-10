DO $$ BEGIN
 CREATE TYPE "public"."member_status" AS ENUM('onboarding', 'inactive', 'active');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_delivery_type" AS ENUM('email', 'push');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."request_status" AS ENUM('pending', 'fulfilled', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."token_type" AS ENUM('authentication', 'session');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"author_id" varchar(16) NOT NULL,
	"request_id" varchar(16),
	"date" timestamp (3) NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "config" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"lets_name" varchar(256) DEFAULT '' NOT NULL,
	"logo_url" varchar(256) DEFAULT '' NOT NULL,
	"currency" varchar(256) NOT NULL,
	"currency_plural" varchar(256) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domain_events" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"entity_id" varchar(16) NOT NULL,
	"type" varchar(256) NOT NULL,
	"payload" json,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interests" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"label" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members_interests" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"interest_id" varchar(16) NOT NULL,
	"description" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"status" "member_status" NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"email_visible" boolean NOT NULL,
	"phone_numbers" json DEFAULT '[]'::json NOT NULL,
	"bio" text,
	"address" json,
	"membership_start_date" timestamp (3) DEFAULT now() NOT NULL,
	"notification_delivery" notification_delivery_type[] DEFAULT '{}' NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_device" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"device_subscription" text NOT NULL,
	"device_type" varchar(32) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "member_device_member_id_device_subscription_unique" UNIQUE("member_id","device_subscription")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_deliveries" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"notification_id" varchar(16) NOT NULL,
	"delivery_type" "notification_delivery_type" NOT NULL,
	"target" text NOT NULL,
	"delivered" boolean DEFAULT false NOT NULL,
	"error" json,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"type" varchar(32) NOT NULL,
	"date" timestamp (3) NOT NULL,
	"context" json NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request_answers" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"request_id" varchar(16) NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"date" timestamp (3) NOT NULL,
	"answer" varchar(16) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requests" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"status" "request_status" NOT NULL,
	"date" timestamp (3) DEFAULT CURRENT_DATE NOT NULL,
	"requester_id" varchar(16) NOT NULL,
	"title" varchar(256) NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"value" varchar(256) NOT NULL,
	"expiration_date" timestamp (3) NOT NULL,
	"type" "token_type" NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"status" "transaction_status" NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"payer_id" varchar(16) NOT NULL,
	"recipient_id" varchar(16) NOT NULL,
	"payer_comment" text,
	"recipient_comment" text,
	"creator_id" varchar(16) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members_interests" ADD CONSTRAINT "members_interests_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members_interests" ADD CONSTRAINT "members_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_device" ADD CONSTRAINT "member_device_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_answers" ADD CONSTRAINT "request_answers_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_answers" ADD CONSTRAINT "request_answers_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_members_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payer_id_members_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_id_members_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creator_id_members_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
