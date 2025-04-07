-- kSelectUsers

-- $1 - username
-- $2 - offset
-- $3 - limit

SELECT
    users.id,
    role,
    email,
    status,
    username,
    COALESCE(COUNT(posts.id), 0) AS posts_count
FROM csconfig.users
LEFT JOIN csconfig.posts
ON (users.id = posts.user_id)
WHERE
    NOT removed AND
    ($1 = '' OR username ILIKE $1)
GROUP BY
    users.id
OFFSET $2
LIMIT $3;
