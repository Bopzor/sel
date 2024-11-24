DO $$ BEGIN
 CREATE TYPE "public"."member_role" AS ENUM('member', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "roles" member_role[] DEFAULT '{}' NOT NULL;