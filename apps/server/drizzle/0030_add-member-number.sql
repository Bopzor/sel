CREATE SEQUENCE "public"."member_number_seq" INCREMENT BY 1 START WITH 1 CACHE 1;
ALTER TABLE "members" ADD COLUMN "number" integer;

UPDATE "members" SET "number" = nextval('member_number_seq');

ALTER TABLE "members" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "members" ADD CONSTRAINT "members_number_unique" UNIQUE("number");
