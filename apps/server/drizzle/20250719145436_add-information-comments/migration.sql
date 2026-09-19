ALTER TABLE "comments" ADD COLUMN "information_id" varchar(16);--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_information_id_information_id_fk" FOREIGN KEY ("information_id") REFERENCES "public"."information"("id") ON DELETE no action ON UPDATE no action;

-- added manually, as drizzle doesn't support adding psql constraints
DO $$ BEGIN
 ALTER TABLE "comments" DROP CONSTRAINT "comments_unique_parent_relation";
 ALTER TABLE "comments" ADD CONSTRAINT "comments_unique_parent_relation" CHECK (num_nonnulls("request_id", "event_id", "information_id") = 1);
END $$;
