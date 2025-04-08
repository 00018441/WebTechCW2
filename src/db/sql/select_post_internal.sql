-- kSelectPostInternal

-- $1 - id

SELECT
    id,
    user_id,
    title,
    description,
    updated_at,
    created_at
FROM csconfig.posts
WHERE
    id = $1;
