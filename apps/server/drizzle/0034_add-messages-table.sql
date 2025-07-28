CREATE TABLE "attachements" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"message_id" varchar(16) NOT NULL,
	"file_id" varchar(16) NOT NULL
);

CREATE TABLE "messages" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"html" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);


ALTER TABLE "comments" ADD COLUMN "message_id" varchar(16);
ALTER TABLE "events" ADD COLUMN "message_id" varchar(16);
ALTER TABLE "information" ADD COLUMN "message_id" varchar(16);
ALTER TABLE "requests" ADD COLUMN "message_id" varchar(16);

CREATE OR REPLACE FUNCTION generate_id()
RETURNS text AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

WITH inserted_messages AS (
  INSERT INTO messages (id, text, html, created_at, updated_at)
  SELECT generate_id() id, c.text, c.html, c.created_at, c.updated_at
  FROM comments c
  WHERE c.message_id IS NULL
  RETURNING *
)
UPDATE comments c
SET message_id = m.id
FROM inserted_messages m
WHERE c.text = m.text AND c.html = m.html AND c.created_at = m.created_at AND c.message_id IS NULL;

WITH inserted_messages AS (
  INSERT INTO messages (id, text, html, created_at, updated_at)
  SELECT generate_id() id, e.text, e.html, e.created_at, e.updated_at
  FROM events e
  WHERE e.message_id IS NULL
  RETURNING *
)
UPDATE events e
SET message_id = m.id
FROM inserted_messages m
WHERE e.text = m.text AND e.html = m.html AND e.created_at = m.created_at AND e.message_id IS NULL;

WITH inserted_messages AS (
  INSERT INTO messages (id, text, html, created_at, updated_at)
  SELECT generate_id() id, i.text, i.html, i.created_at, i.updated_at
  FROM information i
  WHERE i.message_id IS NULL
  RETURNING *
)
UPDATE information i
SET message_id = m.id
FROM inserted_messages m
WHERE i.text = m.text AND i.html = m.html AND i.created_at = m.created_at AND i.message_id IS NULL;

WITH inserted_messages AS (
  INSERT INTO messages (id, text, html, created_at, updated_at)
  SELECT generate_id() id, r.text, r.html, r.created_at, r.updated_at
  FROM requests r
  WHERE r.message_id IS NULL
  RETURNING *
)
UPDATE requests r
SET message_id = m.id
FROM inserted_messages m
WHERE r.text = m.text AND r.html = m.html AND r.created_at = m.created_at AND r.message_id IS NULL;

DROP FUNCTION generate_id;

ALTER TABLE "comments" ALTER COLUMN "message_id" SET NOT NULL;
ALTER TABLE "events" ALTER COLUMN "message_id" SET NOT NULL;
ALTER TABLE "information" ALTER COLUMN "message_id" SET NOT NULL;
ALTER TABLE "requests" ALTER COLUMN "message_id" SET NOT NULL;

ALTER TABLE "comments" DROP COLUMN "text";
ALTER TABLE "comments" DROP COLUMN "html";
ALTER TABLE "events" DROP COLUMN "text";
ALTER TABLE "events" DROP COLUMN "html";
ALTER TABLE "information" DROP COLUMN "text";
ALTER TABLE "information" DROP COLUMN "html";
ALTER TABLE "requests" DROP COLUMN "text";
ALTER TABLE "requests" DROP COLUMN "html";
