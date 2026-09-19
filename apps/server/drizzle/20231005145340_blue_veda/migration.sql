CREATE TABLE IF NOT EXISTS "members" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone_numbers" json DEFAULT '[]' NOT NULL,
	"bio" text,
	"address" json,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
