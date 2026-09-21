ALTER TABLE "comments" ADD CONSTRAINT "comments_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id");--> statement-breakpoint
ALTER TABLE "information" ADD CONSTRAINT "information_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id");--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id");