CREATE TABLE IF NOT EXISTS "files" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"original_name" varchar(1024) NOT NULL,
	"mimetype" varchar(32) NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" varchar(16) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_members_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
