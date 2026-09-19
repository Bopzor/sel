ALTER TABLE "public_messages" RENAME TO "information";--> statement-breakpoint
ALTER TABLE "information" DROP CONSTRAINT "public_messages_author_id_members_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "information" ADD CONSTRAINT "information_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
