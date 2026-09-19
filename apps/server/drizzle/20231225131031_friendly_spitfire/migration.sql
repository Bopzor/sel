ALTER TABLE "comments" RENAME COLUMN "body" TO "html";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "html" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "date" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "text" text NOT NULL;