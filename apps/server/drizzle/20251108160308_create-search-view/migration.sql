CREATE VIEW "public"."search_view" AS (
(SELECT e.id, 'event' as type, e.title as text, e.created_at FROM events e)
UNION (SELECT e.id, 'event' as type, m.text as text, e.created_at FROM events e LEFT JOIN messages m ON e.message_id = m.id)
UNION (SELECT i.id, 'information' as type, i.title as text, i.created_at FROM information i)
UNION (SELECT i.id, 'information' as type, m.text as text, i.created_at FROM information i LEFT JOIN messages m ON i.message_id = m.id)
UNION (SELECT r.id, 'request' as type, r.title as text, r.created_at FROM requests r)
UNION (SELECT r.id, 'request' as type, m.text as text, r.created_at FROM requests r LEFT JOIN messages m ON r.message_id = m.id)
UNION
  (SELECT (case when c.event_id is not null then c.event_id when c.request_id is not null then c.request_id when c.information_id is not null then c.information_id else null end) as id,
        (case when c.event_id is not null then 'event' when c.request_id is not null then 'request' when c.information_id is not null then 'information' else null end) as type,
        m.text, c.created_at
  FROM comments c LEFT JOIN messages m ON c.message_id = m.id)
);