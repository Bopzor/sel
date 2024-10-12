ALTER TABLE "subscriptions" RENAME COLUMN "request_id" TO "entity_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_request_id_requests_id_fk";
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_unique_parent_relation";
