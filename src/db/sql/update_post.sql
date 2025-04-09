-- kUpdatePost

-- $1 - post_id
-- $2 - title
-- $3 - description

UPDATE csconfig.posts
SET
    title = $2,
    description = $3,
    updated_at = NOW()
WHERE
    id = $1;
