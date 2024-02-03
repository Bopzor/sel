CREATE TABLE IF NOT EXISTS "request_answers" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"request_id" varchar(16) NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"date" timestamp (3) NOT NULL,
	"answer" varchar(16) NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_answers" ADD CONSTRAINT "request_answers_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_answers" ADD CONSTRAINT "request_answers_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- added manually, as drizzle doesn't support adding psql constraints
DO $$ BEGIN
 ALTER TABLE "request_answers" ADD CONSTRAINT "answer_value" CHECK ("answer" in ('positive', 'negative'));
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;