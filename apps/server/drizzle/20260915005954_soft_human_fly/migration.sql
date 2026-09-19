ALTER TABLE "members" ADD COLUMN "phone_number" varchar(256);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "phone_number_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint

update members set phone_numbers = ("phone_numbers" #>> '{}')::json where json_typeof("phone_numbers") = 'string';

UPDATE "members" SET
  "phone_number" = "phone_numbers"->0->>'number',
  "phone_number_visible" = coalesce(("phone_numbers"->0->>'visible')::boolean, false)
WHERE json_array_length("phone_numbers") > 0;

ALTER TABLE "members" DROP COLUMN "phone_numbers";
