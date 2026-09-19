ALTER TABLE "transactions" ADD COLUMN "request_id" varchar(16);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "event_id" varchar(16);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- added manually, as drizzle doesn't support adding psql constraints
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_unique_entity_relation" CHECK (num_nonnulls("request_id", "event_id") <= 1);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
