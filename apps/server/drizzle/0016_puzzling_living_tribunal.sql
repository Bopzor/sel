CREATE TABLE IF NOT EXISTS "config" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"currency" varchar(256) NOT NULL,
	"currency_plural" varchar(256) NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
