DO $$ BEGIN
 CREATE TYPE "public"."member_status" AS ENUM('onboarding', 'inactive', 'active');
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
CREATE TABLE IF NOT EXISTS "domain_events" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"entity" varchar(256) NOT NULL,
	"entity_id" varchar(16) NOT NULL,
	"type" varchar(256) NOT NULL,
	"payload" json,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
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
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
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
