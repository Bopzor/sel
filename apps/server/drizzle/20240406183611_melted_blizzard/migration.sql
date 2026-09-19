ALTER TABLE "comments" ADD COLUMN "event_id" varchar(16);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- added manually, as drizzle doesn't support adding psql constraints
DO $$ BEGIN
 ALTER TABLE "comments" DROP CONSTRAINT "comments_unique_parent_relation";
 ALTER TABLE "comments" ADD CONSTRAINT "comments_unique_parent_relation" CHECK (num_nonnulls("request_id", "event_id") = 1);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
