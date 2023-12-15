CREATE TABLE IF NOT EXISTS "comments" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"author_id" varchar(16) NOT NULL,
	"request_id" varchar(16),
	"date" timestamp(3),
	"body" text,
	"created_at" timestamp(3) NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requests" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- added manually, as drizzle doesn't support adding psql constraints
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_unique_parent_relation" CHECK (num_nonnulls("request_id") = 1);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
