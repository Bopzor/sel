CREATE TABLE IF NOT EXISTS "domain_events" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"entity" varchar(256) NOT NULL,
	"entity_id" varchar(16) NOT NULL,
	"type" varchar(256) NOT NULL,
	"payload" json,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
