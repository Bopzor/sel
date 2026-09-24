CREATE TYPE "payment_method" AS ENUM('card', 'cash', 'transfer', 'check');--> statement-breakpoint
CREATE TABLE "membership_payment" (
	"id" varchar(16) PRIMARY KEY,
	"member_id" varchar(16) NOT NULL,
	"amount" numeric NOT NULL,
	"paid_at" timestamp(3) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"period_start" timestamp(3) NOT NULL,
	"period_end" timestamp(3) NOT NULL,
	"comment" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "membership_payment" ADD CONSTRAINT "membership_payment_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id");