ALTER TABLE "information" ADD COLUMN "title" varchar(256) ;

UPDATE "information" SET "title" = '';

ALTER TABLE "information" ALTER COLUMN "title" SET NOT NULL;
