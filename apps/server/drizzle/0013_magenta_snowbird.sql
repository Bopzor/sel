ALTER TABLE "notifications" DROP CONSTRAINT "notifications_event_id_domain_events_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "entity_id" varchar(16);--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "push" json;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "email" json;--> statement-breakpoint

UPDATE "notifications" SET "push" = to_json('{"title":"' || title || '","titleTrimmed":"' || title_trimmed || '","content":"' || content || '"}');
UPDATE "notifications" SET "email" = '{}';

ALTER TABLE "notifications" ALTER COLUMN "push" SET NOT NULL;
ALTER TABLE "notifications" ALTER COLUMN "email" SET NOT NULL;

ALTER TABLE "notifications" DROP COLUMN IF EXISTS "event_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "title_trimmed";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "content";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "data";
