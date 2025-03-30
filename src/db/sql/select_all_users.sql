SELECT
    id,
    username,
    last_seen
FROM csconfig.users
WHERE
    removed = FALSE;

