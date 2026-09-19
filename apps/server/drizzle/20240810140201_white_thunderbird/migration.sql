DO $$ BEGIN
 CREATE TYPE "transaction_status" AS ENUM('pending', 'completed', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payer_id_members_id_fk" FOREIGN KEY ("payer_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_id_members_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creator_id_members_id_fk" FOREIGN KEY ("creator_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
