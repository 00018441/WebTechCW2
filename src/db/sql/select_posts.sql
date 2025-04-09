-- kSelectPosts

-- $1 - title
-- $2 - description
-- $3 - offset
-- $4 - limit

SELECT
    posts.id,
    posts.user_id,
    users.username,
    users.status,
    posts.title,
    posts.description,
    posts.updated_at,
    posts.created_at,
    COALESCE(COUNT(post_settings.setting_id), 0) AS post_settings_count
FROM csconfig.posts
LEFT JOIN csconfig.post_settings
ON (posts.id = post_settings.post_id)
LEFT JOIN csconfig.users
ON (posts.user_id = users.id)
WHERE
    ($1 = '' OR title ILIKE $1)
    AND ($2 = '' OR description ILIKE $2)
GROUP BY
    posts.id, users.username, users.status
OFFSET $3
LIMIT $4;
