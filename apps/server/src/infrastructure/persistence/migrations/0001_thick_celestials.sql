DO $$ BEGIN
 CREATE TYPE "tokenType" AS ENUM('authentication', 'session');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"value" varchar(256) NOT NULL,
	"expiration_date" timestamp(3) NOT NULL,
	"type" "tokenType" NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
