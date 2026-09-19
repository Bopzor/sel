CREATE VIEW "public"."feed_view" AS (
(SELECT e.id, 'event' as type, e.created_at FROM events e)
UNION (SELECT i.id, 'information' as type, i.created_at FROM information i)
UNION (SELECT r.id, 'request' as type, r.created_at FROM requests r));