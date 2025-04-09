-- kSelectPostInternal

-- $1 - id

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
LEFT JOIN csconfig.users
ON (posts.user_id = users.id)
LEFT JOIN csconfig.post_settings
ON (posts.id = post_settings.post_id)
WHERE
    posts.id = $1
GROUP BY
    posts.id, users.username, users.status;
