CREATE TABLE IF NOT EXISTS "public_messages" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"is_pin" boolean NOT NULL,
	"author_id" varchar(16),
	"published_at" timestamp (3) NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public_messages" ADD CONSTRAINT "public_messages_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
