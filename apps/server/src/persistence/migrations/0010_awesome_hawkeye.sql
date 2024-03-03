DO $$ BEGIN
 CREATE TYPE "event_kind" AS ENUM('internal', 'external');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "event_participation" AS ENUM('yes', 'no');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_participations" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"event_id" varchar(16) NOT NULL,
	"participant_id" varchar(16) NOT NULL,
	"participation" "event_participation" NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "event_participations_event_id_participant_id_unique" UNIQUE("event_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"organizer_id" varchar(16) NOT NULL,
	"title" varchar(256) NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"date" timestamp (3),
	"location" varchar(256),
	"kind" "event_kind" NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_participations" ADD CONSTRAINT "event_participations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_participations" ADD CONSTRAINT "event_participations_participant_id_members_id_fk" FOREIGN KEY ("participant_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_members_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
