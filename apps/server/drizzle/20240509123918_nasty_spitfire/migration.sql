CREATE TABLE IF NOT EXISTS "interests" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"label" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members_interests" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"interest_id" varchar(16) NOT NULL,
	"description" text,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members_interests" ADD CONSTRAINT "members_interests_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members_interests" ADD CONSTRAINT "members_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "interests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
